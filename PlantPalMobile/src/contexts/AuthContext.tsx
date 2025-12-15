// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextType = {
  user: { email: string } | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  setUser: (
    user: { email: string } | null,
    access?: string,
    refresh?: string
  ) => void;
  signOut: () => Promise<void>;
  getAuthHeader: () => { Authorization: string } | {};
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  setUser: () => {},
  signOut: async () => {},
  getAuthHeader: () => ({}),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<{ email: string } | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const storedAccess = await AsyncStorage.getItem("accessToken");
        const storedRefresh = await AsyncStorage.getItem("refreshToken");

        console.log("📱 Loaded from storage:", { storedUser, hasAccess: !!storedAccess });

        if (storedUser && storedAccess && storedRefresh) {
          setUserState(JSON.parse(storedUser));
          setAccessToken(storedAccess);
          setRefreshToken(storedRefresh);
        }
      } catch (err) {
        console.error("Failed to load auth data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Set or clear user and tokens
  const setUser = (
    user: { email: string } | null,
    access?: string,
    refresh?: string
  ) => {
    console.log("🔵 setUser called with:", { user, access, refresh });

    if (user && access && refresh) {
      // ✅ Update state FIRST (synchronous, triggers re-render immediately)
      setUserState(user);
      setAccessToken(access);
      setRefreshToken(refresh);

      console.log("🟢 State updated - user:", user.email);

      // ✅ Then persist to AsyncStorage (asynchronous, happens in background)
      AsyncStorage.setItem("user", JSON.stringify(user));
      AsyncStorage.setItem("accessToken", access);
      AsyncStorage.setItem("refreshToken", refresh);
    } else {
      setUserState(null);
      setAccessToken(null);
      setRefreshToken(null);

      console.log("🔴 User cleared");

      AsyncStorage.multiRemove(["user", "accessToken", "refreshToken"]);
    }
  };

  // Sign out
  const signOut = async () => {
    console.log("🚪 Signing out...");
    setUserState(null);
    setAccessToken(null);
    setRefreshToken(null);
    await AsyncStorage.multiRemove(["user", "accessToken", "refreshToken"]);
  };

  // Quick helper to add JWT headers in API requests
  const getAuthHeader = () => {
    if (!accessToken) return {};
    return { Authorization: `Bearer ${accessToken}` };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        loading,
        setUser,
        signOut,
        getAuthHeader,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);