import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAllSystemFlags } from './supabaseSystem';

const SystemFlagsContext = createContext({});

export const useSystemFlags = () => useContext(SystemFlagsContext);

export const SystemFlagsProvider = ({ children }) => {
  const [flags, setFlags] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchFlags = async () => {
    const data = await getAllSystemFlags();
    const flagsMap = {};
    if (data && data.length > 0) {
      data.forEach(flag => {
        flagsMap[flag.key] = flag.value;
      });
    } else {
      // Fallback defaults if db fetch fails
      flagsMap['armada_sentra_enabled'] = true;
      flagsMap['armada_padajaya_enabled'] = true;
      flagsMap['registration_enabled'] = true;
      flagsMap['wa_notifications_enabled'] = true;
      flagsMap['google_oauth_enabled'] = true;
      flagsMap['ai_chat_enabled'] = true;
    }
    setFlags(flagsMap);
    setLoading(false);
  };

  useEffect(() => {
    fetchFlags();

    // Auto-refresh flags every 2 minutes
    const interval = setInterval(fetchFlags, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SystemFlagsContext.Provider value={{ flags, loading, refreshFlags: fetchFlags }}>
      {children}
    </SystemFlagsContext.Provider>
  );
};
