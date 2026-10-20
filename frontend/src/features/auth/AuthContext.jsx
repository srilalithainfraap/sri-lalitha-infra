import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getItem, setItem, removeItem, KEYS } from '../../utils/storage';
import * as authApi from '../../api/auth';
import { clearToken, TOKEN_KEY } from '../../api/client';

const AuthContext = createContext(null);

// Normalise a backend user object to the shape the rest of the app expects
function normaliseUser(apiUser) {
  return {
    id:        apiUser._id ?? apiUser.id,
    name:      apiUser.name,
    email:     apiUser.email,
    mobile:    apiUser.mobile,
    role:      apiUser.role,
    savedPlots: apiUser.savedPlots ?? [],
  };
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading]         = useState(true);

  // On mount, try to restore session from persisted JWT
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setLoading(false); return; }

    authApi.getMe()
      .then(({ user }) => setCurrentUser(normaliseUser(user)))
      .catch((err) => {
        // Only discard the token when the server explicitly rejects it (401).
        // On network errors (no status) keep the token so the user stays
        // logged in during transient backend downtime.
        if (err.status === 401) {
          clearToken();
          removeItem(KEYS.SESSION);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const { user } = await authApi.login({ email, password });
      const norm = normaliseUser(user);
      setCurrentUser(norm);
      // Keep a lightweight session record for pages that read KEYS.SESSION
      setItem(KEYS.SESSION, { userId: norm.id, role: norm.role });
      return { success: true, role: norm.role };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid email or password.' };
    }
  }, []);

  const register = useCallback(async ({ name, email, mobile, password, confirmPassword }) => {
    try {
      const { user } = await authApi.register({ name, email, mobile, password, confirmPassword });
      const norm = normaliseUser(user);
      setCurrentUser(norm);
      setItem(KEYS.SESSION, { userId: norm.id, role: norm.role });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed.' };
    }
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setCurrentUser(null);
    removeItem(KEYS.SESSION);
  }, []);

  const toggleSavedPlot = useCallback(async (plotId) => {
    try {
      const { savedPlots } = await authApi.toggleSavedPlot(plotId);
      setCurrentUser((u) => u ? { ...u, savedPlots } : u);
    } catch { /* ignore */ }
  }, []);

  const session = currentUser
    ? { userId: currentUser.id, role: currentUser.role }
    : null;

  return (
    <AuthContext.Provider value={{
      currentUser,
      session,
      loading,
      login,
      register,
      logout,
      toggleSavedPlot,
      isAdmin: currentUser?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
