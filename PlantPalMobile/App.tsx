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
import SignUp from "./pages/SignUp";
import MainTab from "./pages/MainTab";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";
import PlantDetails from "./pages/PlantDetails";

import { AuthProvider, useAuth } from "./src/contexts/AuthContext";

// Navigation type definition
export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Main: undefined;
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  PlantDetails: {
    plantId: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { user, loading } = useAuth();

  console.log("🔄 AppNavigator render - user:", user?.email || "null", "loading:", loading);

  if (loading) {
    console.log("⏳ Still loading auth state...");
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  console.log(user ? "✅ Showing authenticated screens" : "🔒 Showing login screens");

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {user ? (
        <>
          {/* Main Tab Navigator (Search, Scan, Journal) */}
          <Stack.Screen name="Main" component={MainTab} />

          {/* Plant Details (opened from Search results) */}
          <Stack.Screen
            name="PlantDetails"
            component={PlantDetails}
            options={{
              animation: "slide_from_right",
              gestureEnabled: true,
            }}
          />

          {/* Profile screens */}
          <Stack.Screen
            name="Profile"
            component={Profile}
            options={{
              animation: "slide_from_right",
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfile}
            options={{
              animation: "slide_from_right",
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="Settings"
            component={Settings}
            options={{
              animation: "slide_from_right",
              gestureEnabled: true,
            }}
          />
        </>
      ) : (
        <>
          {/* Auth screens */}
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
    const timer = setTimeout(() => {
      console.log("✨ Splash screen done");
      setShowSplash(false);
    }, 2000);
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