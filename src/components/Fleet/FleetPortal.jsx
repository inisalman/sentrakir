import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Capacitor } from "@capacitor/core";
import { supabase } from "../../utils/supabaseClient";
import "../../styles/fleet.css";
import { ToastProvider, useToast } from "./Toast.jsx";
import {
  getFleetDatabase,
  initFleetData,
  ADMINS
} from "../../utils/fleetMockData.js";
import {
  getAdminByEmail,
  getAdminByCode
} from "../../utils/supabaseAdmin.js";
import {
  createCompany,
  getCompanyByAuthUserId,
  uploadPaymentProof,
  updateCompany
} from "../../utils/supabaseClientAuth.js";
import { logActivity } from "../../utils/supabaseLog.js";
import { notifClientDaftarFree, notifClientDaftarPaid } from "../../utils/notificationWA.js";
import { sendEmail, verifyToken } from "../../utils/supabaseEmail.js";
import TermsModal from "./TermsModal.jsx";
import { SystemFlagsProvider, useSystemFlags } from "../../utils/SystemFlagsContext.jsx";

const ClientDashboard = React.lazy(() => import('./ClientDashboard.jsx'));
const AdminDashboard = React.lazy(() => import('./AdminDashboard.jsx'));
const SuperAdminDashboard = React.lazy(() => import('./SuperAdminDashboard.jsx'));

  // Custom router hook/logic
  const useFleetPath = () => {
    const [path, setPath] = useState(window.location.pathname === '/fleet' ? '/fleet/login' : window.location.pathname);

    useEffect(() => {
      // Normalisasi path jika user akses /fleet saja
      if (window.location.pathname === '/fleet') {
        window.history.replaceState(null, '', '/fleet/login');
      }

      const handlePopState = () => {
        setPath(window.location.pathname);
      };
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }, []);

  const navigate = (toPath) => {
    window.history.pushState(null, "", toPath);
    setPath(toPath);
  };

  return { path, navigate };
};

export default function FleetPortal() {
  return (
    <SystemFlagsProvider>
      <ToastProvider>
        <FleetPortalInner />
      </ToastProvider>
    </SystemFlagsProvider>
  );
}

function FleetPortalInner() {
  const { path, navigate } = useFleetPath();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { flags } = useSystemFlags();
  const toast = useToast();

  // Restore session dari Supabase Auth (JWT)
  useEffect(() => {
    initFleetData();

    const restoreSession = async (session) => {
      try {
        console.log("[Auth] restoreSession called, session:", session ? "YES" : "NO");
        if (!session?.user) {
          console.log("[Auth] No user in session, stopping");
          setLoading(false);
          return;
        }

        // User login via Supabase Auth (Google / email) — auth.uid() now valid
        const authUser = session.user;
        console.log("[Auth] User found:", authUser.email, "ID:", authUser.id);

        // 1. Cek apakah ini Admin
        const adminData = await getAdminByEmail(authUser.email);
        console.log("[Auth] Admin check:", adminData ? "IS ADMIN" : "NOT ADMIN");
        if (adminData) {
          setUser({
            role: "admin",
            clientId: null,
            adminId: adminData.id,
            email: authUser.email,
            companyName: `${adminData.name} Admin`,
          });

          // Selalu navigate ke admin dashboard kalau belum di dashboard
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/dashboard')) {
            navigate("/fleet/admin/dashboard");
          }
          setLoading(false);
          return;
        }

        // 2. Cek apakah ini Company/Client via auth_user_id link
        // Karena ada delay trigger database, kita query ke companies berdasarkan email juga sebagai fallback
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select(`id, name, admin_id, membership_tier, membership_price, subscription_status, status, auth_user_id`)
          .or(`auth_user_id.eq.${authUser.id},email.eq.${authUser.email}`)
          .maybeSingle();

        if (companyError) {
          console.error("[Auth] Error fetching company:", companyError.message);
        }

        if (company) {
          // Jika company ketemu via email tapi auth_user_id belum ter-link, update secara diam-diam
          if (!company.auth_user_id) {
            supabase.from('companies').update({ auth_user_id: authUser.id }).eq('id', company.id).then();
          }

          setUser({
            role: "client",
            clientId: company.id,
            adminId: null,
            email: authUser.email,
            companyName: company.name,
          });

          // Selalu navigate ke client dashboard kalau belum di dashboard
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/dashboard')) {
            navigate("/fleet/client/dashboard");
          }
        } else {
          // Kasus aneh: Auth user ada, tapi trigger gagal bikin company.
          // Kita akan buatkan company kosongan secara langsung agar user bisa masuk ke Dashboard.
          console.warn("[Auth] Company record missing for user. Creating placeholder record...");
          const { data: newCompany, error: createErr } = await supabase
            .from('companies')
            .insert([{
              name: authUser.user_metadata?.company_name || authUser.user_metadata?.full_name || authUser.email.split('@')[0],
              email: authUser.email,
              membership_tier: 'free',
              status: 'active',
              auth_user_id: authUser.id
            }])
            .select()
            .single();

          if (!createErr && newCompany) {
            setUser({
              role: "client",
              clientId: newCompany.id,
              adminId: null,
              email: authUser.email,
              companyName: newCompany.name,
            });
            navigate("/fleet/client/dashboard");
          } else {
            console.error("[Auth] Failed to create placeholder company:", createErr);
            const currentPath = window.location.pathname;
            if (currentPath !== "/fleet/register") {
              navigate("/fleet/register");
            }
          }
        }
      } catch (err) {
        console.error("[Auth] Fatal error in restoreSession:", err);
      } finally {
        setLoading(false);
      }
    };

    // Cek session aktif saat ini
    console.log("[Auth] Initial pathname:", window.location.pathname, "hash:", window.location.hash);
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("[Auth] getSession error:", error);
      }
      const session = data?.session;
      console.log("[Auth] getSession result:", session ? "HAS SESSION" : "NO SESSION");
      // Jika url mengandung hash access_token (dari Google), biarkan onAuthStateChange yang handle
      // untuk mencegah double restoreSession yang bikin kedip / masuk landing page.
      if (window.location.hash.includes("access_token") || window.location.hash.includes("error_description")) {
        console.log("[Auth] Skipping getSession — access_token or error in hash, letting onAuthStateChange handle it");
        return;
      }
      restoreSession(session);
    }).catch(err => {
      console.error("[Auth] getSession crashed:", err);
      setLoading(false);
    });

    // Listen perubahan auth state (login/logout/callback Google)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("[Auth] onAuthStateChange event:", _event, "session:", session ? "YES" : "NO");
      if (session) console.log("[Auth] Session data user email:", session.user.email);
      if (_event === "SIGNED_IN" || _event === "INITIAL_SESSION") {
        restoreSession(session);
      } else if (_event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
      } else if (_event === "USER_UPDATED") {
        restoreSession(session);
      } else {
        // Fallback catch for other events if stuck
        setTimeout(() => setLoading(false), 3000);
      }
    });

    // Handle deep link dari OAuth callback (native platform only)
    const handleDeepLink = async (url) => {
      console.log('[DeepLink] Received URL:', url);

      // Extract hash fragment (contains access_token, refresh_token, etc)
      // Format: com.sentrakir.fleet://#access_token=...&refresh_token=...
      const hashIndex = url.indexOf('#');
      if (hashIndex === -1) {
        console.log('[DeepLink] No hash fragment found');
        return;
      }

      const hashFragment = url.substring(hashIndex + 1);
      const params = new URLSearchParams(hashFragment);

      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (!accessToken || !refreshToken) {
        console.log('[DeepLink] Missing tokens in URL');
        return;
      }

      console.log('[DeepLink] Setting session with tokens from deep link');

      // Set session dengan tokens dari deep link
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        console.error('[DeepLink] Failed to set session:', error);
      } else {
        console.log('[DeepLink] Session set successfully, user:', data.user?.email);
      }
    };

    // Listen untuk app URL open events (deep links)
    let deepLinkListener;
    if (Capacitor.isNativePlatform()) {
      import('@capacitor/app').then(({ App }) => {
        App.addListener('appUrlOpen', (data) => {
          handleDeepLink(data.url);
        }).then((listener) => {
          deepLinkListener = listener;
        });
      });
    }

    return () => {
      subscription.unsubscribe();
      if (deepLinkListener) {
        deepLinkListener.remove();
      }
    };
  }, []);

  const handleLogin = async (role, id, email, companyName) => {
    // Catat log login
    logActivity({
      actorType: role,
      actorId: id,
      actorEmail: email,
      action: "LOGIN",
      metadata: { role, method: role === 'client' ? 'supabase_auth' : 'custom_rpc' }
    });

    // Admin/Super Admin — session is from Supabase Auth JWT, no localStorage fallback
    if (role === "admin" || role === "super_admin") {
      setUser({ role: role, clientId: null, adminId: id, email, companyName });
      toast.show(`Login berhasil! Selamat datang, ${companyName || email}`, "success");

      if (role === "super_admin") {
        navigate("/fleet/superadmin/dashboard");
      } else {
        navigate("/fleet/admin/dashboard");
      }
    } else {
      // Client — get company by id for fresh data
      try {
        const { data: company } = await supabase
          .from('companies')
          .select(`id, name, admin_id, membership_tier, membership_price, subscription_status, status`)
          .eq('id', id)
          .maybeSingle();
        const name = company?.name || companyName;
        setUser({
          role: "client",
          clientId: id,
          adminId: null,
          email,
          companyName: name,
        });
        toast.show(`Login berhasil! Selamat datang, ${name}`, "success");
        navigate("/fleet/client/dashboard");
      } catch (err) {
        console.error("[Login] Failed to set user state:", err);
      }
    }
  };

  const handleLogout = async () => {
    const role = user?.role;
    // Bersihkan localStorage legacy fallback
    localStorage.removeItem("fleet_logged_in");
    localStorage.removeItem("fleet_user_role");
    localStorage.removeItem("fleet_client_id");
    localStorage.removeItem("fleet_admin_id");
    localStorage.removeItem("fleet_user_email");
    localStorage.removeItem("fleet_company_name");
    setUser(null);
    toast.show("Berhasil logout", "info");

    // Logout dari Supabase Auth
    await supabase.auth.signOut();

    if (role === "admin") {
      navigate("/fleet/admin/login");
    } else {
      navigate("/fleet/login");
    }
  };

  if (loading) {
    return (
      <div
        className="fleet-portal-wrapper"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div className="dashboard-loading-spinner"></div>
      </div>
    );
  }

  // Route protection
  const isAuthenticated = !!user;

  if (!isAuthenticated) {
    // Super Admin login — halaman terpisah
    if (path === "/fleet/superadmin/login") {
      return <SuperAdminLoginPage onLogin={handleLogin} navigate={navigate} />;
    }
    // Admin login — halaman terpisah
    if (path === "/fleet/admin/login") {
      return <AdminLoginPage onLogin={handleLogin} navigate={navigate} />;
    }
    // Email flows
    if (path === "/fleet/forgot-password") {
      return <ForgotPasswordPage navigate={navigate} />;
    }
    if (path === "/fleet/reset-password") {
      return <ResetPasswordPage navigate={navigate} />;
    }
    if (path === "/fleet/confirm-register") {
      return <ConfirmRegisterPage navigate={navigate} />;
    }
    // Client routes
    return (
      <>
        {path === "/fleet/register" ? (
          flags.registration_enabled ? (
            <RegisterPage onLogin={handleLogin} navigate={navigate} />
          ) : (
            <div className="fleet-login-bg">
              <div className="fleet-login-card" style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>⛔</div>
                <h2 style={{ color: "#dc2626", margin: "0 0 12px 0" }}>Pendaftaran Ditutup</h2>
                <p style={{ color: "#64748b", margin: "0 0 24px 0" }}>
                  Maaf, pendaftaran client baru sedang ditutup sementara oleh sistem.<br/>Silakan hubungi administrator kami.
                </p>
                <button className="fleet-btn fleet-btn-secondary" onClick={() => navigate("/fleet/login")}>
                  Kembali ke Login
                </button>
              </div>
            </div>
          )
        ) : (
          <LoginPage onLogin={handleLogin} navigate={navigate} />
        )}
      </>
    );
  }

  // Logged-in routing
  if (user.role === "super_admin") {
    // Super Admin subpages
    return (
      <React.Suspense fallback={
        <div className="fleet-portal-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <div className="dashboard-loading-spinner"></div>
        </div>
      }>
        <SuperAdminDashboard
          user={user}
          onLogout={handleLogout}
          currentPath={path}
          navigate={navigate}
        />
      </React.Suspense>
    );
  } else if (user.role === "admin") {
    // Admin subpages
    return (
      <React.Suspense fallback={
        <div className="fleet-portal-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <div className="dashboard-loading-spinner"></div>
        </div>
      }>
        <AdminDashboard
          user={user}
          onLogout={handleLogout}
          currentPath={path}
          navigate={navigate}
        />
      </React.Suspense>
    );
  } else {
    // Client subpages
    return (
      <React.Suspense fallback={
        <div className="fleet-portal-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <div className="dashboard-loading-spinner"></div>
        </div>
      }>
        <ClientDashboard
          user={user}
          onLogout={handleLogout}
          currentPath={path}
          navigate={navigate}
        />
      </React.Suspense>
    );
  }
}

// ----------------------------------------------------
// LOGIN PAGE COMPONENT
// ----------------------------------------------------
function LoginPage({ onLogin, navigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickLogin, setShowQuickLogin] = useState(false);
  const { flags } = useSystemFlags();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Email dan password harus diisi.");
      setIsLoading(false);
      return;
    }

    // Login via native Supabase Auth — password never sent to our server
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      setError("Kredensial Perusahaan tidak valid.");
      setIsLoading(false);
      return;
    }

    // Get company linked to this auth user
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(`id, name, status, email`)
      .eq('auth_user_id', authData.user.id)
      .maybeSingle();

    if (companyError || !company) {
      setError("Akun perusahaan tidak ditemukan. Silakan daftar ulang.");
      await supabase.auth.signOut();
      setIsLoading(false);
      return;
    }

    if (company.status !== "active") {
      setError("Akun perusahaan Anda sedang tidak aktif.");
      await supabase.auth.signOut();
      setIsLoading(false);
      return;
    }

    onLogin("client", company.id, company.email || email, company.name);
    // Note: We don't need to set isLoading(false) here because the component will unmount
    // or the state will be managed by the parent's restoreSession logic.
  };

  const handleQuickLogin = (company) => {
    if (company.status !== "active") {
      setError("Akun perusahaan ini sedang tidak aktif.");
      return;
    }
    onLogin("client", company.id, company.email, company.name);
  };

  const getClientAccounts = () => {
    const db = getFleetDatabase();
    return db.companies || [];
  };

  return (
    <div className="fleet-login-bg">
      <div className="fleet-login-card">
        <div className="fleet-login-header">
          <img
            src="/logo-sentra-kir.png"
            alt="Sentra KIR Logo"
            className="fleet-login-logo"
            style={{ objectFit: "contain" }}
          />
          <h1 className="fleet-login-title">Sentra Fleet</h1>
          <p className="fleet-login-subtitle">
            B2B Compliance Portal & Fleet Administration Management
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="fleet-form-group">
            <label className="fleet-label">Alamat Email</label>
            <input
              type="email"
              className="fleet-input"
              placeholder="nama@perusahaan.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
            />
          </div>

          <div className="fleet-form-group">
            <label className="fleet-label">Password</label>
            <input
              type="password"
              className="fleet-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div
              style={{
                color: "#dc2626",
                fontSize: "13px",
                margin: "-10px 0 20px 0",
                textAlign: "left",
                fontWeight: "600",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="fleet-btn-submit" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? "Memeriksa..." : "Masuk ke Portal"}
          </button>
        </form>

        {/* Google Login */}
        {flags.google_oauth_enabled && (
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ flex: 1, borderTop: "1px solid #e2e8f0" }}></div>
              <span style={{ fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap" }}>
                atau masuk dengan
              </span>
              <div style={{ flex: 1, borderTop: "1px solid #e2e8f0" }}></div>
            </div>
            <button
              type="button"
              className="fleet-btn-submit"
              style={{
                background: "#ffffff",
                color: "#1e293b",
                border: "1px solid #cbd5e1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                fontWeight: "600",
              }}
              onClick={async (e) => {
                e.preventDefault();
                try {
                  console.log("[Google Auth] Start login...");
                  console.log("[Google Auth] isNative:", Capacitor.isNativePlatform());

                  if (Capacitor.isNativePlatform()) {
                    // Native: buka Google OAuth di in-app browser (Capacitor Browser)
                    console.log("[Google Auth] Native OAuth via Capacitor Browser...");
                    const { Browser } = await import('@capacitor/browser');

                    // Buat redirect URL dengan deep link scheme untuk ditangkap oleh app
                    const redirectUrl = "com.sentrakir.fleet://auth-callback";

                    // Get OAuth URL dari Supabase tanpa auto-redirect
                    const { data, error } = await supabase.auth.signInWithOAuth({
                      provider: "google",
                      options: {
                        redirectTo: redirectUrl,
                        skipBrowserRedirect: true, // Jangan auto-open browser
                      },
                    });
                    if (error) throw error;

                    if (data?.url) {
                      console.log("[Google Auth] Opening in-app browser:", data.url);
                      // Buka di in-app browser (bukan external browser)
                      await Browser.open({
                        url: data.url,
                        presentationStyle: 'fullscreen',
                        toolbarColor: '#1e293b',
                      });
                    }
                  } else {
                    // Web: pakai browser OAuth biasa
                    console.log("[Google Auth] Web OAuth flow...");
                    const redirectUrl = `${window.location.origin}/fleet/login`;
                    const { data, error } = await supabase.auth.signInWithOAuth({
                      provider: "google",
                      options: {
                        redirectTo: redirectUrl,
                        skipBrowserRedirect: false,
                      },
                    });
                    if (error) throw error;
                  }
                } catch (err) {
                  console.error("[Google Auth] ERROR:", err);
                  console.error("[Google Auth] Error message:", err.message);
                  console.error("[Google Auth] Error stack:", err.stack);
                  setError("Login Google gagal: " + err.message);
                }
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.98 1 12 1 7.28 1 3.26 3.74 1.45 7.72l3.86 3C6.22 7.73 8.89 5.04 12 5.04z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.11 2.73-2.36 3.58l3.66 2.84c2.14-1.98 3.39-4.88 3.39-8.57z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.31 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28l-3.86-3C.64 8.24 0 10.04 0 12s.64 3.76 1.45 5.28l3.86-3z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.1.74-2.5 1.18-4.3 1.18-3.11 0-5.78-2.69-6.69-5.68l-3.86 3C3.26 20.26 7.28 23 12 23z"
                />
              </svg>
              Masuk dengan Google
            </button>
          </div>
        )}

        {flags.registration_enabled && (
          <p style={{ marginTop: "24px", fontSize: "14px", color: "#6b7a96", textAlign: "center" }}>
            Perusahaan Anda belum terdaftar?{" "}
            <span
              style={{ color: "#1C3967", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}
              onClick={() => navigate("/fleet/register")}
            >
              Daftar Sekarang
            </span>
          </p>
        )}

        <p style={{ marginTop: "12px", fontSize: "13px", color: "#6b7a96", textAlign: "center" }}>
          Lupa password?{" "}
          <span
            style={{ color: "#1C3967", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}
            onClick={() => navigate("/fleet/forgot-password")}
          >
            Reset Password
          </span>
        </p>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// ADMIN LOGIN PAGE COMPONENT
// ----------------------------------------------------
function AdminLoginPage({ onLogin, navigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Email dan password harus diisi.");
      setIsLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        console.error("Auth Error:", authError.message);
        setError("Kredensial Administrator tidak valid. (" + authError.message + ")");
        setIsLoading(false);
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', authData.user.email)
        .maybeSingle();

      if (adminError || !admin) {
        setError("Akun admin tidak ditemukan.");
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      console.log("Admin login via Supabase Auth.");
      onLogin("admin", admin.id, email, `${admin.name} Admin`);
    } catch (err) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fleet-login-bg">
      <div className="fleet-login-card">
        <div className="fleet-login-header">
          <img
            src="/logo-sentra-kir.png"
            alt="Sentra KIR Logo"
            className="fleet-login-logo"
            style={{ objectFit: "contain" }}
          />
          <h1 className="fleet-login-title">Sentra Fleet</h1>
          <p className="fleet-login-subtitle">Portal Administrator</p>
        </div>

        <p style={{ margin: "0 0 20px 0", fontSize: "14px", fontWeight: "700", color: "#1C3967", textAlign: "center" }}>
          Administrator
        </p>

        <form onSubmit={handleSubmit}>
          <div className="fleet-form-group">
            <label className="fleet-label">Email Administrator</label>
            <input
              type="email"
              className="fleet-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="fleet-form-group">
            <label className="fleet-label">Password</label>
            <input
              type="password"
              className="fleet-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{ color: "#dc2626", fontSize: "13px", margin: "-10px 0 20px 0", fontWeight: "600" }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="fleet-btn-submit" disabled={isLoading}>
            {isLoading ? "Memverifikasi..." : "Masuk"}
          </button>
        </form>

        <p style={{ marginTop: "24px", fontSize: "12px", color: "#94a3b8", textAlign: "center" }}>
          Login sebagai Klien Perusahaan?{" "}
          <span
            style={{ color: "#1C3967", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}
            onClick={() => navigate("/fleet/login")}
          >
            Masuk di sini
          </span>
        </p>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// SUPER ADMIN LOGIN PAGE COMPONENT
// ----------------------------------------------------
function SuperAdminLoginPage({ onLogin, navigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Email dan password harus diisi.");
      setIsLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        console.error("Auth Error:", authError.message);
        setError("Kredensial Super Administrator tidak valid. (" + authError.message + ")");
        setIsLoading(false);
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', authData.user.email)
        .maybeSingle();

      if (adminError || !admin) {
        setError("Akun Super Admin tidak ditemukan.");
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      if (!admin.is_super) {
        setError("Akses Super Admin ditolak.");
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      console.log("Super Admin login via Supabase Auth.");
      onLogin("super_admin", admin.id, email, `${admin.name} Super Admin`);
    } catch (err) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fleet-login-bg" style={{ backgroundColor: "#0f172a" }}>
      <div className="fleet-login-card">
        <div className="fleet-login-header">
          <img
            src="/logo-sentra-kir.png"
            alt="Sentra KIR Logo"
            className="fleet-login-logo"
            style={{ objectFit: "contain" }}
          />
          <h1 className="fleet-login-title" style={{ color: "#1C3967" }}>Sentra Fleet</h1>
          <p className="fleet-login-subtitle">System Control Portal</p>
        </div>

        <p style={{ margin: "0 0 20px 0", fontSize: "14px", fontWeight: "800", color: "#b91c1c", textAlign: "center", textTransform: "uppercase", letterSpacing: "1px" }}>
          Super Administrator
        </p>

        <form onSubmit={handleSubmit}>
          <div className="fleet-form-group">
            <label className="fleet-label">Email Super Admin</label>
            <input
              type="email"
              className="fleet-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="fleet-form-group">
            <label className="fleet-label">Password</label>
            <input
              type="password"
              className="fleet-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{ color: "#dc2626", fontSize: "13px", margin: "-10px 0 20px 0", fontWeight: "600" }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="fleet-btn-submit" disabled={isLoading} style={{ backgroundColor: "#b91c1c" }}>
            {isLoading ? "Memverifikasi..." : "System Login"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <a href="/fleet/admin/login" style={{ fontSize: "13px", color: "#6b7a96", textDecoration: "none" }}>
            ← Kembali ke Standard Admin Login
          </a>
        </div>
      </div>
    </div>
  );
}
// ----------------------------------------------------
function RegisterPage({ onLogin, navigate }) {
  const { flags } = useSystemFlags();
  // step: "method" | "terms" | "tier" | "detail" | "payment"
  const [step, setStep] = useState("method");
  // "email" | "google"
  const [authMethod, setAuthMethod] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    picName: "",
    picPhone: "",
    email: "",
    password: "",
    address: "",
    membershipTier: "free",
    adminChoice: "sentra", // "sentra" | "padajaya"
  });
  const [googleData, setGoogleData] = useState(null); // { email, name }
  const [paymentFile, setPaymentFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState(null); // for "check email" screen

  const ADMIN_CODES = {
    sentra: "SENTRA-2024",
    padajaya: "PADAJAYA-2024",
  };

  const PRICING = {
    free: 0,
    starter: 399000,
    business: 499000,
    enterprise: 0,
  };

  const isPaid = formData.membershipTier !== "free";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: user pilih email → lanjut ke step terms
  const handleChooseEmail = () => {
    setAuthMethod("email");
    setError("");
    setStep("terms");
  };

  // Step 1: user pilih Google → Supabase OAuth creates auth user, then
  // restoreSession handles company lookup. handleGoogleSuccess just stores the
  // Google JWT data for later use in registration.
  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) return;
    const decoded = jwtDecode(credentialResponse.credential);
    const { email, name } = decoded;

    // After Supabase OAuth redirect, restoreSession will handle company lookup.
    // We just store the decoded data for the registration form.
    setGoogleData({ email, name });
    setFormData((prev) => ({ ...prev, name: name || "", picName: name || "", email }));
    setAuthMethod("google");
    setError("");
    setStep("terms");
  };

  // Step 2: T&C → lanjut ke pilih tier
  const handleAcceptTerms = () => {
    if (!agreedToTerms) {
      setError("Anda harus menyetujui Syarat & Ketentuan untuk melanjutkan.");
      return;
    }
    setError("");
    setStep("tier");
  };

  // Step 3: Pilih tier → lanjut ke isi detail
  const handleChooseTier = (tier) => {
    setFormData((prev) => ({ ...prev, membershipTier: tier }));
    setError("");
    setStep("detail");
  };

  // Step 4: Isi detail → lanjut ke upload (paid) atau langsung submit (free)
  const handleDetailNext = () => {
    setError("");
    if (!formData.name || !formData.picName || !formData.picPhone) {
      setError("Mohon lengkapi semua kolom wajib.");
      return;
    }
    if (authMethod === "email" && (!formData.email || !formData.password)) {
      setError("Email dan password wajib diisi.");
      return;
    }
    if (authMethod === "email" && formData.password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (authMethod === "email" && !/[A-Z]/.test(formData.password)) {
      setError("Password harus mengandung minimal 1 huruf kapital.");
      return;
    }
    if (authMethod === "email" && !/[^a-zA-Z0-9]/.test(formData.password)) {
      setError("Password harus mengandung minimal 1 simbol (contoh: @, #, !).");
      return;
    }
    if (isPaid) {
      setStep("payment");
    } else {
      handleFinalSubmit();
    }
  };

  // Step 5 (paid): Submit dengan bukti bayar
  const handlePaymentSubmit = async () => {
    setError("");
    if (!paymentFile) {
      setError("Mohon upload bukti pembayaran.");
      return;
    }
    handleFinalSubmit();
  };

  // Final: buat company di Supabase
  const handleFinalSubmit = async () => {
    setLoading(true);
    setError("");

    const emailToUse = authMethod === "google" ? googleData.email : formData.email;

    // Resolve admin ID dari kode
    const adminData = await getAdminByCode(ADMIN_CODES[formData.adminChoice]);
    if (!adminData || !adminData.id) {
      setError("Gagal memverifikasi administrator. Silakan coba lagi.");
      setLoading(false);
      return;
    }

    let result;
    let filePath = null;

    if (authMethod === "email") {
      // Email registration: create auth user + company via Edge Function
      // Password stays server-side, never in browser
      const response = await supabase.functions.invoke('register-with-auth', {
        body: {
          name: formData.name,
          pic_name: formData.picName,
          pic_phone: formData.picPhone,
          email: emailToUse,
          password: formData.password,
          address: formData.address,
          membership_tier: formData.membershipTier,
          admin_id: adminData.id,
        },
      });

      let error = response.error;
      let data = response.data;

      // Handle non-2xx errors gracefully
      if (error && error.context && typeof error.context.json === 'function') {
        try {
          const errBody = await error.context.json();
          if (errBody && errBody.error) {
            error = new Error(errBody.error);
          }
        } catch (e) {
          // Keep original error if parsing fails
        }
      } else if (error && error.message) {
        // If the library already parsed the JSON or it's a generic text error
        try {
          const parsed = JSON.parse(error.message);
          if (parsed.error) {
            error = new Error(parsed.error);
          }
        } catch(e) {
           // Might be a pure string
        }
      }

      if (error || !data?.company) {
        const msg = error?.message || data?.error || "Gagal mendaftarkan perusahaan.";
        // Specific error for already-registered email
        if (msg.toLowerCase().includes('already been registered') || msg.toLowerCase().includes('already registered')) {
          setError("Email ini sudah terdaftar. Silakan gunakan email lain atau login.");
        } else {
          setError(msg);
        }
        setLoading(false);
        return;
      }

      result = data.company;
    } else {
      // Google registration: create company via Edge Function (secure server-side validation)
      // Ambil user ID aktif langsung dari sesi Supabase agar tidak meleset
      let activeUserId = googleData?.id;
      if (!activeUserId) {
        const { data: sessionData } = await supabase.auth.getSession();
        activeUserId = sessionData?.session?.user?.id;
      }

      const response = await supabase.functions.invoke('register-google-with-auth', {
        body: {
          name: formData.name,
          pic_name: formData.picName,
          pic_phone: formData.picPhone,
          email: emailToUse,
          address: formData.address,
          membership_tier: formData.membershipTier,
          admin_id: adminData.id,
          auth_user_id: activeUserId || null,
        },
      });

      let error = response.error;
      let data = response.data;

      // Handle non-2xx errors gracefully
      if (error && error.context && typeof error.context.json === 'function') {
        try {
          const errBody = await error.context.json();
          if (errBody && errBody.error) {
            error = new Error(errBody.error);
          }
        } catch (e) {
          // Keep original error if parsing fails
        }
      } else if (error && error.message) {
        // If the library already parsed the JSON or it's a generic text error
        try {
          const parsed = JSON.parse(error.message);
          if (parsed.error) {
            error = new Error(parsed.error);
          }
        } catch(e) {
           // Might be a pure string
        }
      }

      if (error || !data?.company) {
        const msg = error?.message || data?.error || "Gagal mendaftarkan perusahaan.";
        // Specific error for already-registered email
        if (msg.toLowerCase().includes('already been registered') || msg.toLowerCase().includes('already registered')) {
          setError("Email ini sudah terdaftar. Silakan gunakan email lain atau login.");
        } else {
          setError(msg);
        }
        setLoading(false);
        return;
      }

      result = data.company;
    }

    // Upload bukti bayar jika paid
    if (isPaid && paymentFile) {
      try {
        filePath = await uploadPaymentProof(paymentFile, emailToUse);
        await updateCompany(result.id, { payment_proof_path: filePath });
      } catch (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    }

    // Kirim notif WA (via Edge Function — API key tidak di browser)
    if (flags.wa_notifications_enabled && formData.picPhone) {
      if (isPaid) {
        notifClientDaftarPaid(formData.picPhone, result.name, formData.membershipTier, formData.adminChoice);
      } else {
        notifClientDaftarFree(formData.picPhone, result.name);
      }
    }

    // Kirim email verifikasi registrasi
    if (authMethod === "email") {
      try {
        await sendEmail({
          type: "register",
          email: emailToUse,
          companyName: result.name,
          companyId: result.id
        });
      } catch (err) {
        console.error("Gagal mengirim email verifikasi:", err);
      }
    }

    setLoading(false);

    // Redirect logic after successful registration:
    // - Paid membership + Email → show email confirmation page
    // - Free membership (any method) or Paid + Google → auto login to dashboard
    if (isPaid && authMethod === "email") {
      setRegisteredEmail(emailToUse);
      setStep("email-sent");
    } else {
      onLogin("client", result.id, emailToUse, result.name);
    }
  };

  // Step indicator labels
  const STEPS = ["Metode", "T&C", "Paket", "Data", isPaid ? "Pembayaran" : null].filter(Boolean);
  const STEP_KEYS = ["method", "terms", "tier", "detail", isPaid ? "payment" : null].filter(Boolean);
  const currentStepIndex = STEP_KEYS.indexOf(step);

  return (
    <div className="fleet-login-bg">
      <div className="fleet-login-card" style={{ maxWidth: "560px" }}>
        <div className="fleet-login-header">
          <img
            src="/logo-sentra-kir.png"
            alt="Sentra KIR Logo"
            className="fleet-login-logo"
            style={{ objectFit: "contain" }}
          />
          <h1 className="fleet-login-title">Daftar Sentra Fleet</h1>
          <p className="fleet-login-subtitle">Registrasi Layanan Kepatuhan Armada B2B</p>
        </div>

        {/* Step indicator */}
        {step !== "method" && (
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
            {STEPS.map((label, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700",
                  background: i < currentStepIndex ? "#22c55e" : i === currentStepIndex ? "#1C3967" : "#e2e8f0",
                  color: i <= currentStepIndex ? "white" : "#94a3b8",
                }}>
                  {i < currentStepIndex ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: "11px", color: i === currentStepIndex ? "#1C3967" : "#94a3b8", fontWeight: i === currentStepIndex ? "700" : "400" }}>
                  {label}
                </span>
                {i < STEPS.length - 1 && <div style={{ width: 20, height: 1, background: "#e2e8f0" }} />}
              </div>
            ))}
          </div>
        )}

        {/* STEP CONTENT */}

        {/* EMAIL SENT: Registrasi paid via email — tampilkan halaman cek inbox + status pending */}
        {step === "email-sent" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>📧</div>
            <h2 style={{ fontSize: "18px", color: "#1C3967", margin: "0 0 12px 0" }}>Cek Email Anda!</h2>
            <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.6", margin: "0 0 8px 0" }}>
              Kami telah mengirim link konfirmasi ke:<br />
              <strong style={{ color: "#1C3967" }}>{registeredEmail}</strong>
            </p>
            <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 20px 0" }}>
              Klik link di email untuk mengaktifkan akun. Link berlaku 24 jam.
            </p>
            <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 24px 0" }}>
              Tidak menerima email? Cek folder Spam atau Promo.
            </p>

            {/* Status pending payment info */}
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "16px", marginBottom: "20px", textAlign: "left" }}>
              <p style={{ fontSize: "13px", color: "#92400e", margin: "0 0 8px 0", fontWeight: "700" }}>
                ⏳ Status Membership: Menunggu Konfirmasi
              </p>
              <p style={{ fontSize: "13px", color: "#92400e", margin: 0, lineHeight: "1.6" }}>
                Akun Anda telah terdaftar dengan paket <strong>{formData.membershipTier}</strong>.
                Saat ini Anda dapat masuk ke dashboard dengan akses Free. Membership akan aktif setelah pembayaran dikonfirmasi oleh Admin.
              </p>
            </div>

            <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "16px", fontSize: "13px", color: "#64748b", textAlign: "left" }}>
              <strong style={{ color: "#1C3967" }}>Langkah selanjutnya:</strong>
              <ol style={{ margin: "8px 0 0 20px", padding: 0, lineHeight: "1.8" }}>
                <li>Buka email dari <strong>Sentra Fleet</strong></li>
                <li>Klik tombol <strong>"Konfirmasi Email Saya"</strong></li>
                <li>Login dan gunakan dashboard dengan akses Free</li>
                <li>Admin akan mengkonfirmasi pembayaran & mengaktifkan membership Anda</li>
              </ol>
            </div>
            <div style={{ marginTop: "24px" }}>
              <a href="/fleet/login" style={{ fontSize: "13px", color: "#1C3967", fontWeight: "700", textDecoration: "none" }}>
                Masuk ke Dashboard →
              </a>
            </div>
          </div>
        )}

        {/* STEP 5: Upload bukti bayar (paid only) */}
        {step === "payment" && (
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1C3967", marginBottom: "8px" }}>
              Upload Bukti Pembayaran
            </h3>
            <p style={{ fontSize: "13px", color: "#6b7a96", marginBottom: "16px" }}>
              Upload bukti transfer untuk paket <strong>{formData.membershipTier}</strong>.
            </p>

            {/* Info box: bisa login dulu dengan Free */}
            <div style={{ background: "#f0f4ff", border: "1px solid #c7d9f5", borderRadius: "10px", padding: "14px", marginBottom: "20px" }}>
              <p style={{ fontSize: "13px", color: "#1C3967", margin: 0, lineHeight: "1.6" }}>
                💡 Setelah upload bukti bayar, Anda bisa langsung login dan menggunakan dashboard dengan akses <strong>Free</strong>.
                Membership akan diaktifkan oleh Admin setelah pembayaran dikonfirmasi.
              </p>
            </div>

            {/* Info Pembayaran */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
              <p style={{ fontSize: "13px", fontWeight: "700", color: "#1C3967", marginBottom: "12px" }}>Tujuan Pembayaran</p>

              {/* Transfer BCA */}
              <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#374151" }}>🏦 Transfer Bank BCA</span>
                </div>
                <div style={{ fontSize: "13px", color: "#475569" }}>
                  <div>No. Rekening: <strong style={{ color: "#1C3967", fontSize: "15px", letterSpacing: "1px" }}>2750685113</strong></div>
                  <div style={{ marginTop: "2px" }}>a.n. <strong>Akbar Al Fatih</strong></div>
                </div>
              </div>

              {/* QRIS */}
              <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#374151" }}>📱 QRIS</span>
                  <span style={{ fontSize: "10px", background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: "20px", fontWeight: "600" }}>Segera Hadir</span>
                </div>
                <div style={{ textAlign: "center", padding: "16px", background: "#f8fafc", borderRadius: "6px", color: "#94a3b8", fontSize: "12px" }}>
                  QRIS akan tersedia segera
                </div>
              </div>

              <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "10px" }}>
                * Nominal transfer sesuai paket yang dipilih. Konfirmasi dalam 1x24 jam kerja.
              </p>
            </div>

            <div className="fleet-form-group">
              <label className="fleet-label">Bukti Pembayaran *</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.doc,.docx,.heic"
                className="fleet-input"
                style={{ padding: "8px", cursor: "pointer" }}
                onChange={(e) => setPaymentFile(e.target.files[0] || null)}
              />
              <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "6px" }}>
                Format: JPG, JPEG, PNG, DOC, HEIC — Maks. 5MB
              </p>
            </div>

            {paymentFile && (
              <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#166534", marginBottom: "16px" }}>
                ✅ {paymentFile.name}
              </div>
            )}

            {error && (
              <div style={{ color: "#dc2626", fontSize: "13px", marginBottom: "16px", fontWeight: "600" }}>
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handlePaymentSubmit}
              className="fleet-btn-submit"
              disabled={loading}
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Mendaftarkan..." : "Kirim & Masuk Dashboard"}
            </button>

            <button
              type="button"
              onClick={() => { setStep("detail"); setError(""); }}
              style={{ background: "none", border: "none", color: "#6b7a96", fontSize: "13px", cursor: "pointer", marginTop: "12px", display: "block", width: "100%", textAlign: "center" }}
            >
              ← Kembali
            </button>
          </div>
        )}

        {/* STEP 4: Isi data PT */}
        {step === "detail" && (
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1C3967", marginBottom: "16px" }}>
              Data Perusahaan
            </h3>

            {/* Email & Password — hanya untuk email path */}
            {authMethod === "email" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="fleet-form-group">
                  <label className="fleet-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="fleet-input"
                    placeholder="contoh@perusahaan.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                </div>
                <div className="fleet-form-group">
                  <label className="fleet-label">Password *</label>
                  <input
                    type="password"
                    name="password"
                    className="fleet-input"
                    placeholder="Buat password..."
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                    Min. 8 karakter, 1 huruf kapital, dan 1 simbol (contoh: @, #, !)
                  </p>
                </div>
              </div>
            )}

            <div className="fleet-form-group">
              <label className="fleet-label">Nama PT / Pemilik Armada *</label>
              <input
                type="text"
                name="name"
                className="fleet-input"
                placeholder="PT Maju Bersama Logistik"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="fleet-form-group">
                <label className="fleet-label">Nama PIC *</label>
                <input
                  type="text"
                  name="picName"
                  className="fleet-input"
                  placeholder="Ahmad Yani"
                  value={formData.picName}
                  onChange={handleChange}
                />
              </div>
              <div className="fleet-form-group">
                <label className="fleet-label">No. WhatsApp PIC *</label>
                <input
                  type="text"
                  name="picPhone"
                  className="fleet-input"
                  placeholder="62812xxxxxx"
                  value={formData.picPhone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Pilih Admin */}
            <div className="fleet-form-group">
              <label className="fleet-label">Pilih Administrator *</label>
              <select
                name="adminChoice"
                className="fleet-input"
                value={formData.adminChoice}
                onChange={handleChange}
                style={{ marginTop: "6px" }}
              >
                {flags.armada_sentra_enabled && <option value="sentra">Admin Sentra</option>}
                {flags.armada_padajaya_enabled && <option value="padajaya">Admin Padajaya</option>}
              </select>
            </div>

            <div className="fleet-form-group">
              <label className="fleet-label">Alamat Kantor</label>
              <textarea
                name="address"
                className="fleet-input"
                placeholder="Jl. Raya Cakung No. 10..."
                value={formData.address}
                onChange={handleChange}
                rows="2"
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            {error && (
              <div style={{ color: "#dc2626", fontSize: "13px", marginBottom: "16px", fontWeight: "600" }}>
                ⚠️ {error}
              </div>
            )}

            <button onClick={handleDetailNext} className="fleet-btn-submit">
              {isPaid ? "Lanjut ke Pembayaran" : "Daftar & Masuk Dashboard"}
            </button>

            <button
              type="button"
              onClick={() => { setStep("tier"); setError(""); }}
              style={{ background: "none", border: "none", color: "#6b7a96", fontSize: "13px", cursor: "pointer", marginTop: "12px", display: "block", width: "100%", textAlign: "center" }}
            >
              ← Kembali
            </button>
          </div>
        )}

        {/* STEP 3: Pilih paket membership */}
        {step === "tier" && (
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1C3967", marginBottom: "8px" }}>
              Pilih Paket Membership
            </h3>
            <p style={{ fontSize: "13px", color: "#6b7a96", marginBottom: "20px" }}>
              Pilih paket yang sesuai dengan ukuran armada Anda.
            </p>

            {[
              { value: "free", label: "Free", desc: "1–10 Kendaraan", price: "Gratis", badge: null },
              { value: "starter", label: "Starter", desc: "11–30 Kendaraan + AI Chat Pengurusan", price: "Rp 399.000/bln", badge: "Populer" },
              { value: "business", label: "Business", desc: "31–50 Kendaraan + Semua fitur Starter", price: "Rp 499.000/bln", badge: null },
              { value: "enterprise", label: "Enterprise", desc: "50–100 Kendaraan + Semua fitur Starter", price: "Custom Pricing", badge: "Enterprise" },
            ].map((tier) => (
              <button
                key={tier.value}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, membershipTier: tier.value }))}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 16px", marginBottom: "10px", borderRadius: "10px", cursor: "pointer",
                  border: "2px solid", borderColor: formData.membershipTier === tier.value ? "#1C3967" : "#e2e8f0",
                  background: formData.membershipTier === tier.value ? "#f0f4ff" : "white",
                  textAlign: "left",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: "700", fontSize: "14px", color: "#1C3967" }}>{tier.label}</span>
                    {tier.badge && (
                      <span style={{ background: "#1C3967", color: "white", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px" }}>
                        {tier.badge}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7a96", marginTop: "2px" }}>{tier.desc}</div>
                </div>
                <span style={{ fontWeight: "700", fontSize: "14px", color: "#1C3967" }}>{tier.price}</span>
              </button>
            ))}

            <button
              onClick={() => handleChooseTier(formData.membershipTier)}
              className="fleet-btn-submit"
              style={{ marginTop: "12px" }}
            >
              Lanjutkan
            </button>

            <button
              type="button"
              onClick={() => { setStep("terms"); setError(""); }}
              style={{ background: "none", border: "none", color: "#6b7a96", fontSize: "13px", cursor: "pointer", marginTop: "12px", display: "block", width: "100%", textAlign: "center" }}
            >
              ← Kembali
            </button>
          </div>
        )}

        {/* STEP 2: T&C */}
        {step === "terms" && (
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1C3967", marginBottom: "16px" }}>
              Syarat & Ketentuan
            </h3>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  style={{ marginTop: "2px", width: "16px", height: "16px", cursor: "pointer", flexShrink: 0 }}
                />
                <span style={{ fontSize: "13px", color: "#374151", lineHeight: "1.6" }}>
                  Saya telah membaca dan menyetujui{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    style={{ background: "none", border: "none", padding: 0, color: "#1C3967", fontWeight: "700", cursor: "pointer", fontSize: "13px", textDecoration: "underline" }}
                  >
                    Syarat & Ketentuan
                  </button>
                  {" "}dan{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    style={{ background: "none", border: "none", padding: 0, color: "#1C3967", fontWeight: "700", cursor: "pointer", fontSize: "13px", textDecoration: "underline" }}
                  >
                    Kebijakan Privasi
                  </button>
                  {" "}Sentra Fleet.
                </span>
              </label>
            </div>

            {error && (
              <div style={{ color: "#dc2626", fontSize: "13px", marginBottom: "16px", fontWeight: "600" }}>
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleAcceptTerms}
              className="fleet-btn-submit"
              disabled={!agreedToTerms}
              style={{ opacity: agreedToTerms ? 1 : 0.5 }}
            >
              Lanjut
            </button>

            <button
              type="button"
              onClick={() => { setStep("method"); setError(""); }}
              style={{ background: "none", border: "none", color: "#6b7a96", fontSize: "13px", cursor: "pointer", marginTop: "12px", display: "block", width: "100%", textAlign: "center" }}
            >
              ← Kembali
            </button>

            <TermsModal
              isOpen={showTermsModal}
              onClose={() => setShowTermsModal(false)}
              onAccept={() => { setAgreedToTerms(true); setShowTermsModal(false); }}
            />
          </div>
        )}

        {/* STEP 1: Pilih metode daftar */}
        {step === "method" && (
          <div>
            <button
              onClick={handleChooseEmail}
              className="fleet-btn-submit"
              style={{ marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
            >
              Daftar dengan Email
            </button>

            {flags.google_oauth_enabled && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "16px 0" }}>
                  <div style={{ flex: 1, borderTop: "1px solid #e2e8f0" }} />
                  <span style={{ fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap" }}>atau</span>
                  <div style={{ flex: 1, borderTop: "1px solid #e2e8f0" }} />
                </div>

                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    type="button"
                    className="fleet-btn-submit"
                    style={{
                      background: "#ffffff",
                      color: "#1e293b",
                      border: "1px solid #cbd5e1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      fontWeight: "600",
                    }}
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        // Native: pakai Google account picker langsung
                        if (Capacitor.isNativePlatform()) {
                          const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
                          const user = await GoogleAuth.signIn();
                          const { error } = await supabase.auth.signInWithIdToken({
                            provider: 'google',
                            token: user.authentication.idToken,
                          });
                          if (error) throw error;
                        } else {
                          // Web: pakai browser OAuth
                          const redirectUrl = `${window.location.origin}/fleet/login`; // Samakan redirect url dengan tombol login agar masuk dashboard
                          const { data, error } = await supabase.auth.signInWithOAuth({
                            provider: "google",
                            options: {
                              redirectTo: redirectUrl,
                              skipBrowserRedirect: false,
                            },
                          });
                          if (error) throw error;
                        }
                      } catch (err) {
                        console.error("Auth error:", err);
                        setError("Daftar dengan Google gagal: " + err.message);
                      }
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.98 1 12 1 7.28 1 3.26 3.74 1.45 7.72l3.86 3C6.22 7.73 8.89 5.04 12 5.04z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.11 2.73-2.36 3.58l3.66 2.84c2.14-1.98 3.39-4.88 3.39-8.57z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.31 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28l-3.86-3C.64 8.24 0 10.04 0 12s.64 3.76 1.45 5.28l3.86-3z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.1.74-2.5 1.18-4.3 1.18-3.11 0-5.78-2.69-6.69-5.68l-3.86 3C3.26 20.26 7.28 23 12 23z"
                      />
                    </svg>
                    Daftar dengan Google
                  </button>
                </div>
              </>
            )}

            {error && (
              <div style={{ color: "#dc2626", fontSize: "13px", marginTop: "16px", fontWeight: "600" }}>
                ⚠️ {error}
              </div>
            )}

            <p style={{ marginTop: "24px", fontSize: "14px", color: "#6b7a96", textAlign: "center" }}>
              Sudah terdaftar?{" "}
              <span
                style={{ color: "#1C3967", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}
                onClick={() => navigate("/fleet/login")}
              >
                Masuk Portal
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// FORGOT PASSWORD PAGE
// ----------------------------------------------------
function ForgotPasswordPage({ navigate }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    const result = await sendEmail({ type: "reset", email: email.trim() });

    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="fleet-login-bg">
      <div className="fleet-login-card">
        <div className="fleet-login-header">
          <img src="/logo-sentra-kir.png" alt="Sentra KIR" className="fleet-login-logo" style={{ objectFit: "contain" }} />
          <h1 className="fleet-login-title">Sentra Fleet</h1>
          <p className="fleet-login-subtitle">Lupa Password</p>
        </div>

        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📧</div>
            <h2 style={{ fontSize: "18px", color: "#1C3967", margin: "0 0 12px 0" }}>Email Terkirim!</h2>
            <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.6", margin: "0 0 24px 0" }}>
              Kami telah mengirim link reset password ke <strong>{email}</strong>.<br />
              Buka email dan klik tombol "Reset Password".<br />
              Link berlaku selama 1 jam.
            </p>
            <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 20px 0" }}>
              Tidak menerima email? Cek folder Spam atau minta lagi.
            </p>
            <button className="fleet-btn fleet-btn-secondary" onClick={() => navigate("/fleet/login")}>
              Kembali ke Login
            </button>
          </div>
        ) : (
          <>
            <p style={{ color: "#64748b", fontSize: "14px", textAlign: "center", margin: "0 0 24px 0" }}>
              Masukkan email akun Anda. Kami akan mengirim link untuk mereset password.
            </p>
            {error && (
              <div style={{
                fontSize: "13px",
                marginBottom: "12px",
                fontWeight: "600",
                padding: "12px 16px",
                borderRadius: "8px",
                background: error.includes("Google") ? "#eff6ff" : "#fef2f2",
                color: error.includes("Google") ? "#1e40af" : "#dc2626",
                border: `1px solid ${error.includes("Google") ? "#bfdbfe" : "#fca5a5"}`,
              }}>
                {error.includes("Google") ? "ℹ️" : "⚠️"} {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="fleet-form-group">
                <label className="fleet-label">Email Akun</label>
                <input
                  type="email"
                  className="fleet-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pic@perusahaan.com"
                  required
                />
              </div>
              <button type="submit" className="fleet-btn-submit" disabled={loading} style={{ width: "100%" }}>
                {loading ? "Mengirim..." : "Kirim Link Reset Password"}
              </button>
            </form>
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <a href="/fleet/login" style={{ fontSize: "13px", color: "#6b7a96", textDecoration: "none" }}>
                ← Kembali ke Login
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// RESET PASSWORD PAGE
// ----------------------------------------------------
function ResetPasswordPage({ navigate }) {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Password wajib diisi."); return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter."); return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password harus mengandung minimal 1 huruf kapital."); return;
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      setError("Password harus mengandung minimal 1 simbol."); return;
    }
    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak sama."); return;
    }

    setLoading(true);
    const result = await verifyToken({ token, newPassword: password });

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="fleet-login-bg">
        <div className="fleet-login-card" style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
          <h2 style={{ color: "#dc2626", margin: "0 0 12px 0" }}>Link Tidak Valid</h2>
          <p style={{ color: "#64748b", margin: "0 0 24px 0" }}>Link reset password tidak valid atau sudah kadaluwarsa.</p>
          <button className="fleet-btn fleet-btn-secondary" onClick={() => navigate("/fleet/forgot-password")}>
            Minta Reset Password Baru
          </button>
          <div style={{ marginTop: "16px" }}>
            <a href="/fleet/login" style={{ fontSize: "13px", color: "#6b7a96" }}>← Kembali ke Login</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fleet-login-bg">
      <div className="fleet-login-card">
        <div className="fleet-login-header">
          <img src="/logo-sentra-kir.png" alt="Sentra KIR" className="fleet-login-logo" style={{ objectFit: "contain" }} />
          <h1 className="fleet-login-title">Sentra Fleet</h1>
          <p className="fleet-login-subtitle">Buat Password Baru</p>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <h2 style={{ fontSize: "18px", color: "#15803d", margin: "0 0 12px 0" }}>Password Berhasil Diubah!</h2>
            <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 24px 0" }}>
              Password akun Anda telah diperbarui. Silakan login dengan password baru.
            </p>
            <button className="fleet-btn fleet-btn-primary" style={{ width: "100%" }} onClick={() => navigate("/fleet/login")}>
              Masuk Sekarang
            </button>
          </div>
        ) : (
          <>
            <p style={{ color: "#64748b", fontSize: "14px", textAlign: "center", margin: "0 0 24px 0" }}>
              Masukkan password baru untuk akun Anda.
            </p>
            {error && (
              <div style={{ color: "#dc2626", fontSize: "13px", marginBottom: "12px", fontWeight: "600" }}>
                ⚠️ {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="fleet-form-group">
                <label className="fleet-label">Password Baru</label>
                <input type="password" className="fleet-input" value={password}
                  onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="fleet-form-group">
                <label className="fleet-label">Konfirmasi Password</label>
                <input type="password" className="fleet-input" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <button type="submit" className="fleet-btn-submit" disabled={loading} style={{ width: "100%" }}>
                {loading ? "Menyimpan..." : "Simpan Password Baru"}
              </button>
            </form>
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <a href="/fleet/login" style={{ fontSize: "13px", color: "#6b7a96", textDecoration: "none" }}>
                ← Kembali ke Login
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// CONFIRM REGISTER PAGE
// ----------------------------------------------------
function ConfirmRegisterPage({ navigate }) {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Link konfirmasi tidak valid."); return;
    }
    verifyToken({ token }).then((result) => {
      setLoading(false);
      if (result.error) setError(result.error);
      else setSuccess(true);
    });
  }, [token]);

  if (loading) {
    return (
      <div className="fleet-login-bg">
        <div className="fleet-login-card" style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "36px", marginBottom: "16px" }}>⏳</div>
          <p style={{ color: "#64748b" }}>Memverifikasi akun...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fleet-login-bg">
        <div className="fleet-login-card" style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
          <h2 style={{ color: "#dc2626", margin: "0 0 12px 0" }}>Konfirmasi Gagal</h2>
          <p style={{ color: "#64748b", margin: "0 0 24px 0" }}>{error}</p>
          <button className="fleet-btn fleet-btn-secondary" onClick={() => navigate("/fleet/register")}>
            Daftar Ulang
          </button>
          <div style={{ marginTop: "16px" }}>
            <a href="/fleet/login" style={{ fontSize: "13px", color: "#6b7a96" }}>← Kembali ke Login</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fleet-login-bg">
      <div className="fleet-login-card" style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎉</div>
        <h2 style={{ fontSize: "20px", color: "#15803d", margin: "0 0 12px 0" }}>Email Berhasil Dikonfirmasi!</h2>
        <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.6", margin: "0 0 24px 0" }}>
          Selamat! Akun perusahaan Anda sekarang aktif.<br />
          Silakan login untuk mulai menggunakan Sentra Fleet.
        </p>
        <button className="fleet-btn fleet-btn-primary" style={{ width: "100%" }} onClick={() => navigate("/fleet/login")}>
          Masuk Sekarang
        </button>
      </div>
    </div>
  );
}
