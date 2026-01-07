import React, { useEffect } from "react";
import { TouchableOpacity, Text, Image, StyleSheet, Platform, Alert } from "react-native";
import * as AuthSession from "expo-auth-session";
import { supabase } from "../supabaseClient";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";
import { useAuth } from "../contexts/AuthContext";

type GoogleLoginScreenProp = StackNavigationProp<RootStackParamList, "Login">;

const BASE_URL = Platform.OS === "android" 
  ? "http://127.0.0.1:8000" 
  : "http://localhost:8000";

export default function GoogleLogin() {
  const navigation = useNavigation<GoogleLoginScreenProp>();
  const { setUser } = useAuth();

  const handleGoogleLogin = async () => {
  let redirectUri: string;

  if (Platform.OS === "web") {
    redirectUri = window.location.origin;
  } else {
    // Use default Expo auth proxy for Expo Go
    redirectUri = AuthSession.makeRedirectUri();
    console.log("Redirect URI for this device:", redirectUri);
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { 
      redirectTo: redirectUri,
      skipBrowserRedirect: false,
    },
  });

  if (error) {
    console.error("Login error:", error.message);
    Alert.alert("Error", "Google login failed");
  }
};

  // ✅ Listen for auth state changes and sync with your backend
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        console.log("Google logged in user:", session.user);
        
        try {
          // Send Google user info to your backend
          const response = await fetch(`${BASE_URL}/api/google-login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: session.user.email,
              google_id: session.user.id,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            Alert.alert("Error", result.error || "Failed to sync with server");
            return;
          }

          // Save to AuthContext (same as regular login)
          await setUser(
            { email: result.user.email },
            result.tokens.access,
            result.tokens.refresh
          );

          // Navigate to Main
          navigation.navigate("Main");
          
        } catch (err) {
          console.error("Backend sync error:", err);
          Alert.alert("Error", "Could not connect to server");
        }
      }
    });

    return () => subscription.subscription?.unsubscribe();
  }, [navigation]);

  return (
    <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
      <Image source={require("../../assets/google-icon.png")} style={styles.googleIcon} />
      <Text style={styles.googleText}>Sign in with Google</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 10,
    width: "100%",
    justifyContent: "center",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  googleIcon: { width: 20, height: 20, marginRight: 8 },
  googleText: { fontSize: 16, color: "#333", fontFamily: "Poppins" },
});