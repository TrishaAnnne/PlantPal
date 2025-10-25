import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack"; 
import SplashScreen from "./pages/SplashScreen";
import LoginPage from "./pages/Login";
import ScanPage from "./pages/ScanPage";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import SearchPage from "./pages/SearchPage"; 

import { AuthProvider, useAuth } from "./src/contexts/AuthContext";

export type RootStackParamList = {
  Login: undefined;
  Scan: undefined;
  SignUp: undefined;
  Profile: undefined;
  EditProfile: undefined;
  Search: undefined; // ✅ Added
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// ✅ Navigation depending on auth state
function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right", // 🎞️ Native-stack built-in transition
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="Scan" component={ScanPage} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="EditProfile" component={EditProfile} />

          {/* ✅ SearchPage with native slide transition */}
          <Stack.Screen
            name="Search"
            component={SearchPage}
            options={{
              animation: "slide_from_right",
              gestureEnabled: true,
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginPage} />
          <Stack.Screen name="SignUp" component={SignUp} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <SafeAreaView style={styles.container}>
        <SplashScreen />
      </SafeAreaView>
    );
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
