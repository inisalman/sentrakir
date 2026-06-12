import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "../../styles/fleet.css";
import {
  getFleetDatabase,
  initFleetData,
  ADMINS
} from "../../utils/fleetMockData.js";
import {
  getAdminByEmail,
  validateRegistrationCode
} from "../../utils/supabaseAdmin.js";
import {
  getCompanyByEmail,
  createCompany
} from "../../utils/supabaseClientAuth.js";
import ClientDashboard from "./ClientDashboard.jsx";
import AdminDashboard from "./AdminDashboard.jsx";

// Ganti dengan Google Client ID milik Anda dari Google Cloud Console
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

// Custom router hook/logic
const useFleetPath = () => {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
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
  const { path, navigate } = useFleetPath();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authentication states
  useEffect(() => {
    // Initialize mock database if not already
    initFleetData();

    // Check localStorage session
    const loggedIn = localStorage.getItem("fleet_logged_in") === "true";
    const role = localStorage.getItem("fleet_user_role");
    const clientId = localStorage.getItem("fleet_client_id");
    const adminId = localStorage.getItem("fleet_admin_id");
    const email = localStorage.getItem("fleet_user_email");
    const companyName = localStorage.getItem("fleet_company_name");

    if (loggedIn && role) {
      setUser({ role, clientId, adminId, email, companyName });
    }
    setLoading(false);
  }, []);

  const handleLogin = (role, id, email, companyName) => {
    localStorage.setItem("fleet_logged_in", "true");
    localStorage.setItem("fleet_user_role", role);
    localStorage.setItem("fleet_user_email", email);
    if (role === "admin") {
      localStorage.setItem("fleet_admin_id", id);
      localStorage.removeItem("fleet_client_id");
    } else {
      localStorage.setItem("fleet_client_id", id);
      localStorage.removeItem("fleet_admin_id");
    }
    if (companyName) localStorage.setItem("fleet_company_name", companyName);

    setUser({
      role,
      clientId: role === "client" ? id : null,
      adminId: role === "admin" ? id : null,
      email,
      companyName
    });

    if (role === "admin") {
      navigate("/fleet/admin/dashboard");
    } else {
      navigate("/fleet/client/dashboard");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("fleet_logged_in");
    localStorage.removeItem("fleet_user_role");
    localStorage.removeItem("fleet_client_id");
    localStorage.removeItem("fleet_admin_id");
    localStorage.removeItem("fleet_user_email");
    localStorage.removeItem("fleet_company_name");
    setUser(null);
    navigate("/fleet/login");
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
    if (path === "/fleet/register") {
      return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <RegisterPage onLogin={handleLogin} navigate={navigate} />
        </GoogleOAuthProvider>
      );
    }
    // Any other path goes to Login
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <LoginPage onLogin={handleLogin} navigate={navigate} />
      </GoogleOAuthProvider>
    );
  }

  // Logged-in routing
  if (user.role === "admin") {
    // Admin subpages
    return (
      <AdminDashboard
        user={user}
        onLogout={handleLogout}
        currentPath={path}
        navigate={navigate}
      />
    );
  } else {
    // Client subpages
    return (
      <ClientDashboard
        user={user}
        onLogout={handleLogout}
        currentPath={path}
        navigate={navigate}
      />
    );
  }
}

// ----------------------------------------------------
// LOGIN PAGE COMPONENT
// ----------------------------------------------------
function LoginPage({ onLogin, navigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleTab, setRoleTab] = useState("client"); // client | admin
  const [error, setError] = useState("");
  const [showQuickLogin, setShowQuickLogin] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email dan password harus diisi.");
      return;
    }

    const db = getFleetDatabase();

    if (roleTab === "admin") {
      // Admin Authentication
      const admin = await getAdminByEmail(email);
      if (admin && admin.password === password) {
        onLogin("admin", admin.id, email, `${admin.name} Admin`);
      } else {
        setError("Kredensial Admin tidak valid.");
      }
    } else {
      // Client Authentication
      const company = await getCompanyByEmail(email);
      if (company && company.password === password) {
        if (company.status !== "active") {
          setError("Akun perusahaan Anda sedang tidak aktif.");
          return;
        }
        onLogin("client", company.id, company.email, company.name);
      } else {
        setError("Kredensial Perusahaan tidak valid.");
      }
    }
  };

  const handleQuickLogin = (company) => {
    if (company.status !== "active") {
      setError("Akun perusahaan ini sedang tidak aktif.");
      return;
    }
    onLogin("client", company.id, company.email, company.name);
  };

  const handleQuickAdminLogin = (admin) => {
    onLogin("admin", admin.id, admin.email, `${admin.name} Admin`);
  };

  const getClientAccounts = () => {
    const db = getFleetDatabase();
    return db.companies || [];
  };

  const getAdminAccounts = () => {
    return ADMINS || [];
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

        <div className="role-tabs">
          <button
            type="button"
            className={`role-tab-btn ${roleTab === "client" ? "active" : ""}`}
            onClick={() => {
              setRoleTab("client");
              setError("");
            }}
          >
            Klien Perusahaan
          </button>
          <button
            type="button"
            className={`role-tab-btn ${roleTab === "admin" ? "active" : ""}`}
            onClick={() => {
              setRoleTab("admin");
              setError("");
            }}
          >
            Administrator
          </button>
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

          <button type="submit" className="fleet-btn-submit">
            Masuk ke Portal
          </button>
        </form>

        {/* Quick Login for Development */}
        {roleTab === "client" && (
          <div style={{ marginTop: "16px" }}>
            <button
              type="button"
              onClick={() => setShowQuickLogin(!showQuickLogin)}
              style={{
                width: "100%",
                padding: "10px",
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                color: "#475569",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f1f5f9";
                e.currentTarget.style.borderColor = "#94a3b8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f8fafc";
                e.currentTarget.style.borderColor = "#cbd5e1";
              }}
            >
              {showQuickLogin ? "🔒 Sembunyikan Quick Login" : "⚡ Quick Login (Dev Mode)"}
            </button>

            {showQuickLogin && (
              <div
                style={{
                  marginTop: "12px",
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "12px",
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    margin: "0 0 12px 0",
                    fontWeight: "600",
                  }}
                >
                  📋 Daftar Akun Client Tersedia:
                </p>
                {getClientAccounts().length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#94a3b8",
                      fontSize: "12px",
                    }}
                  >
                    Belum ada akun client terdaftar. Silakan daftar terlebih dahulu.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {getClientAccounts().map((company) => (
                      <button
                        key={company.id}
                        type="button"
                        onClick={() => handleQuickLogin(company)}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "10px 12px",
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#eff6ff";
                          e.currentTarget.style.borderColor = "#3b82f6";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#ffffff";
                          e.currentTarget.style.borderColor = "#e2e8f0";
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: "700",
                              color: "#1C3967",
                              marginBottom: "2px",
                            }}
                          >
                            {company.name}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#64748b",
                            }}
                          >
                            {company.email}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: "4px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "600",
                              color: company.status === "active" ? "#16a34a" : "#dc2626",
                              background: company.status === "active" ? "#f0fdf4" : "#fef2f2",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              border: `1px solid ${company.status === "active" ? "#bbf7d0" : "#fecaca"}`,
                            }}
                          >
                            {company.status === "active" ? "✓ Aktif" : "✗ Non-aktif"}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              color: "#1e40af",
                              background: "#eff6ff",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              border: "1px solid #bfdbfe",
                              fontWeight: "600",
                            }}
                          >
                            {(() => {
                              const admin = getAdminById(company.adminId || 'admin-1');
                              return admin ? admin.name : 'Sentra';
                            })()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quick Login for Admin */}
        {roleTab === "admin" && (
          <div style={{ marginTop: "16px" }}>
            <button
              type="button"
              onClick={() => setShowQuickLogin(!showQuickLogin)}
              style={{
                width: "100%",
                padding: "10px",
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                color: "#475569",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f1f5f9";
                e.currentTarget.style.borderColor = "#94a3b8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f8fafc";
                e.currentTarget.style.borderColor = "#cbd5e1";
              }}
            >
              {showQuickLogin ? "🔒 Sembunyikan Quick Login" : "⚡ Quick Login (Dev Mode)"}
            </button>

            {showQuickLogin && (
              <div
                style={{
                  marginTop: "12px",
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "12px",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    margin: "0 0 12px 0",
                    fontWeight: "600",
                  }}
                >
                  👤 Daftar Akun Admin:
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {getAdminAccounts().map((admin) => (
                    <button
                      key={admin.id}
                      type="button"
                      onClick={() => handleQuickAdminLogin(admin)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 12px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#eff6ff";
                        e.currentTarget.style.borderColor = "#3b82f6";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#ffffff";
                        e.currentTarget.style.borderColor = "#e2e8f0";
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "#1C3967",
                            marginBottom: "2px",
                          }}
                        >
                          {admin.name} Admin
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#64748b",
                          }}
                        >
                          {admin.email}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: "4px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "600",
                            color: admin.status === "active" ? "#16a34a" : "#dc2626",
                            background: admin.status === "active" ? "#f0fdf4" : "#fef2f2",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            border: `1px solid ${admin.status === "active" ? "#bbf7d0" : "#fecaca"}`,
                          }}
                        >
                          {admin.status === "active" ? "✓ Aktif" : "✗ Non-aktif"}
                        </span>
                        <span
                          style={{
                            fontSize: "10px",
                            color: admin.tier === "primary" ? "#7c3aed" : "#f59e0b",
                            background: admin.tier === "primary" ? "#faf5ff" : "#fffbeb",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            border: `1px solid ${admin.tier === "primary" ? "#e9d5ff" : "#fde68a"}`,
                            fontWeight: "600",
                          }}
                        >
                          {admin.tier === "primary" ? "Primary" : "Secondary"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Google Login */}
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div style={{ flex: 1, borderTop: "1px solid #e2e8f0" }}></div>
            <span
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                whiteSpace: "nowrap",
              }}
            >
              atau masuk dengan
            </span>
            <div style={{ flex: 1, borderTop: "1px solid #e2e8f0" }}></div>
          </div>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              if (credentialResponse.credential) {
                const decoded = jwtDecode(credentialResponse.credential);
                const { email, name } = decoded;
                const db = getFleetDatabase();
                if (roleTab === "admin") {
                  const admin = await getAdminByEmail(email);
                  if (admin) {
                    onLogin("admin", admin.id, email, `${admin.name} Admin`);
                  } else {
                    setError("Akun Google tidak terdaftar sebagai Admin.");
                  }
                } else {
                  const company = db.companies.find(
                    (c) => c.email.toLowerCase() === email.toLowerCase(),
                  );
                  if (company) {
                    if (company.status !== "active") {
                      setError("Akun perusahaan Anda sedang tidak aktif.");
                      return;
                    }
                    onLogin("client", company.id, email, company.name);
                  } else {
                    setError(
                      "Email Google tidak terdaftar. Silakan daftar terlebih dahulu.",
                    );
                  }
                }
              }
            }}
            onError={() => setError("Login Google gagal. Silakan coba lagi.")}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            width="300"
          />
        </div>

        {roleTab === "client" && (
          <p
            style={{
              marginTop: "24px",
              fontSize: "14px",
              color: "#6b7a96",
              textAlign: "center",
            }}
          >
            Perusahaan Anda belum terdaftar?{" "}
            <span
              style={{
                color: "#1C3967",
                fontWeight: "700",
                cursor: "pointer",
                textDecoration: "underline",
              }}
              onClick={() => navigate("/fleet/register")}
            >
              Daftar Sekarang
            </span>
          </p>
        )}

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <a
            href="/"
            style={{
              fontSize: "13px",
              color: "#6b7a96",
              textDecoration: "none",
            }}
          >
            ← Kembali ke Landing Page
          </a>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// REGISTER PAGE COMPONENT
// ----------------------------------------------------
function RegisterPage({ onLogin, navigate }) {
  const [formData, setFormData] = useState({
    name: "",
    picName: "",
    picPhone: "",
    email: "",
    password: "",
    address: "",
    membershipTier: "free", // free, kecil, menengah, besar
  });
  const [registrationCode, setRegistrationCode] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validations
    if (
      !formData.name ||
      !formData.picName ||
      !formData.picPhone ||
      !formData.email ||
      !formData.password ||
      !registrationCode
    ) {
      setError("Mohon lengkapi seluruh kolom wajib termasuk Kode Pendaftaran.");
      return;
    }

    // Validate registration code
    const codeResult = await validateRegistrationCode(registrationCode.trim().toUpperCase());
    if (!codeResult.valid) {
      setError("Kode Pendaftaran tidak valid.");
      return;
    }

    const db = getFleetDatabase();

    // Check if email already registered
    const existingCompany = await getCompanyByEmail(formData.email);
    if (existingCompany) {
      setError(
        "Email ini sudah terdaftar. Silakan gunakan email lain atau login.",
      );
      return;
    }

    // Add company
    const newCompanyId = `comp-${Date.now()}`;
    const pricing = {
      free: 0,
      kecil: 499000,
      menengah: 999000,
      besar: "Custom Pricing",
    };

    const newCompany = {
      id: newCompanyId,
      name: formData.name,
      pic_name: formData.picName,
      pic_phone: formData.picPhone,
      email: formData.email,
      password: formData.password,
      address: formData.address,
      membership_tier: formData.membershipTier,
      membership_price: typeof pricing[formData.membershipTier] === 'number' ? pricing[formData.membershipTier] : 0,
      subscription_status: "active",
      status: "active",
      admin_id: codeResult.admin.id // Store which admin handles this client
    };

    const result = await createCompany(newCompany);
    if (!result.success) {
      setError("Gagal mendaftarkan perusahaan: " + result.error);
      return;
    }

    // Log in immediately
    onLogin("client", newCompanyId, formData.email, formData.name);
  };

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
          <p className="fleet-login-subtitle">
            Registrasi Layanan Kepatuhan Armada B2B
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="fleet-form-group">
            <label className="fleet-label">Nama Perusahaan *</label>
            <input
              type="text"
              name="name"
              className="fleet-input"
              placeholder="PT Maju Bersama Logistik"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div className="fleet-form-group">
              <label className="fleet-label">Nama PIC *</label>
              <input
                type="text"
                name="picName"
                className="fleet-input"
                placeholder="Ahmad Yani"
                value={formData.picName}
                onChange={handleChange}
                required
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
                required
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div className="fleet-form-group">
              <label className="fleet-label">Email Perusahaan *</label>
              <input
                type="email"
                name="email"
                className="fleet-input"
                placeholder="pic@perusahaan.com"
                value={formData.email}
                onChange={handleChange}
                required
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
                required
              />
            </div>
          </div>

          <div className="fleet-form-group">
            <label className="fleet-label">
              Ukuran Armada (Membership Tier)
            </label>
            <select
              name="membershipTier"
              className="fleet-input"
              value={formData.membershipTier}
              onChange={handleChange}
              style={{ background: "white" }}
            >
              <option value="free">
                Free (Maks. 5 Kendaraan) - Gratis
              </option>
              <option value="kecil">
                Kecil (1-30 Kendaraan) - Rp 499rb/bln
              </option>
              <option value="menengah">
                Menengah (31-100 Kendaraan) - Rp 999rb/bln
              </option>
              <option value="besar">
                Besar (100+ Kendaraan) - Custom Pricing
              </option>
            </select>
          </div>

          <div className="fleet-form-group">
            <label className="fleet-label">Kode Pendaftaran Administrator *</label>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '12px',
              color: '#475569',
              marginBottom: '8px',
              lineHeight: '1.5'
            }}>
              💡 <strong>Pilihan Administrator Anda:</strong>
              <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px' }}>
                <li>Untuk <strong>Admin Sentra</strong>, gunakan kode: <strong style={{ color: '#1C3967' }}>SENTRA-2024</strong></li>
                <li>Untuk <strong>Admin Padajaya</strong>, gunakan kode: <strong style={{ color: '#1C3967' }}>PADAJAYA-2024</strong></li>
              </ul>
            </div>
            <input
              type="text"
              name="registrationCode"
              className="fleet-input"
              placeholder="Masukkan kode SENTRA-2024 atau PADAJAYA-2024"
              value={registrationCode}
              onChange={(e) => setRegistrationCode(e.target.value)}
              required
              style={{ textTransform: 'uppercase' }}
            />
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

          <button type="submit" className="fleet-btn-submit">
            Daftar & Masuk Dashboard
          </button>
        </form>

        {/* Google Register */}
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div style={{ flex: 1, borderTop: "1px solid #e2e8f0" }}></div>
            <span
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                whiteSpace: "nowrap",
              }}
            >
              atau daftar dengan
            </span>
            <div style={{ flex: 1, borderTop: "1px solid #e2e8f0" }}></div>
          </div>
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                const decoded = jwtDecode(credentialResponse.credential);
                const { email, name } = decoded;
                const db = getFleetDatabase();

                // Check if already registered
                const emailExists = db.companies.some(
                  (c) => c.email.toLowerCase() === email.toLowerCase(),
                );
                if (emailExists) {
                  setError("Email Google sudah terdaftar. Silakan login.");
                  return;
                }

                // Auto-create company with Google data
                const newCompanyId = `comp-${Date.now()}`;
                const newCompany = {
                  id: newCompanyId,
                  name: name || "Perusahaan Baru",
                  picName: name || "",
                  picPhone: "",
                  email: email,
                  address: "",
                  membershipTier: "free",
                  membershipPrice: 0,
                  subscriptionStatus: "active",
                  status: "active",
                  adminId: "admin-1",
                };

                db.companies.push(newCompany);
                localStorage.setItem(
                  "sentra_fleet_database",
                  JSON.stringify(db),
                );
                onLogin("client", newCompanyId, email, newCompany.name);
              }
            }}
            onError={() =>
              setError("Daftar dengan Google gagal. Silakan coba lagi.")
            }
            theme="outline"
            size="large"
            text="signup_with"
            shape="rectangular"
            width="300"
          />
        </div>

        <p
          style={{
            marginTop: "24px",
            fontSize: "14px",
            color: "#6b7a96",
            textAlign: "center",
          }}
        >
          Sudah terdaftar?{" "}
          <span
            style={{
              color: "#1C3967",
              fontWeight: "700",
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() => navigate("/fleet/login")}
          >
            Masuk Portal
          </span>
        </p>
      </div>
    </div>
  );
}
