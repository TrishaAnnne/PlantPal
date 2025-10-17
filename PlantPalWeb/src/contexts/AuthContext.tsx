import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

interface Admin {
  id: string;
  user_name: string;
  email: string;
}

interface AuthContextType {
  admin: Admin | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  setAdmin: (admin: Admin | null, access?: string, refresh?: string) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdminState] = useState<Admin | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Use ref to avoid stale closure issues
  const refreshTokenRef = useRef<string | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem("admin");
      const storedAccess = localStorage.getItem("accessToken");
      const storedRefresh = localStorage.getItem("refreshToken");

      if (storedAdmin) setAdminState(JSON.parse(storedAdmin));
      if (storedAccess) setAccessToken(storedAccess);
      if (storedRefresh) {
        setRefreshToken(storedRefresh);
        refreshTokenRef.current = storedRefresh;
      }
    } catch (err) {
      console.error("Failed to load auth data:", err);
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function - doesn't depend on setAdmin
  const logout = useCallback(() => {
    setAdminState(null);
    setAccessToken(null);
    setRefreshToken(null);
    refreshTokenRef.current = null;
    localStorage.removeItem("admin");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    console.log("🚪 Logged out");
  }, []);

  // Refresh access token - returns new token
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const currentRefreshToken = refreshTokenRef.current;
    
    if (!currentRefreshToken) {
      console.warn("⚠️ No refresh token available");
      logout();
      return null;
    }

    try {
      console.log("🔄 Attempting to refresh access token...");
      
      const res = await fetch("http://127.0.0.1:8000/api/refresh_token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: currentRefreshToken }),
      });

      const data = await res.json();

      if (res.ok && data.access) {
        setAccessToken(data.access);
        localStorage.setItem("accessToken", data.access);
        console.log("✅ Access token refreshed successfully");
        return data.access;
      } else {
        console.error("❌ Failed to refresh token:", data);
        logout();
        return null;
      }
    } catch (err) {
      console.error("❌ Token refresh error:", err);
      logout();
      return null;
    }
  }, [logout]);

  // Save or clear session
  const setAdmin = useCallback(
    (admin: Admin | null, access?: string, refresh?: string) => {
      if (admin) {
        setAdminState(admin);
        localStorage.setItem("admin", JSON.stringify(admin));
        
        if (access) {
          setAccessToken(access);
          localStorage.setItem("accessToken", access);
        }
        
        if (refresh) {
          setRefreshToken(refresh);
          refreshTokenRef.current = refresh;
          localStorage.setItem("refreshToken", refresh);
        }
      } else {
        logout();
      }
    },
    [logout]
  );

  return (
    <AuthContext.Provider
      value={{
        admin,
        accessToken,
        refreshToken,
        loading,
        setAdmin,
        logout,
        refreshAccessToken,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};