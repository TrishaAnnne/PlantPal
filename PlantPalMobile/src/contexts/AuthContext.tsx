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
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  setUser: () => {},
  signOut: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<{ email: string } | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user & tokens from storage on first mount
  useEffect(() => {
    (async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const storedAccess = await AsyncStorage.getItem("accessToken");
        const storedRefresh = await AsyncStorage.getItem("refreshToken");

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

  // Set user + tokens (called after login)
  const setUser = async (
    user: { email: string } | null,
    access?: string,
    refresh?: string
  ) => {
    setUserState(user);

    if (user && access && refresh) {
      setAccessToken(access);
      setRefreshToken(refresh);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("accessToken", access);
      await AsyncStorage.setItem("refreshToken", refresh);
    } else {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      setAccessToken(null);
      setRefreshToken(null);
    }
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, refreshToken, loading, setUser, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ custom hook
export const useAuth = () => useContext(AuthContext);
