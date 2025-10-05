import React, { useEffect } from "react";
import { TouchableOpacity, Text, Image, StyleSheet, Platform } from "react-native";
import * as AuthSession from "expo-auth-session";
import { supabase } from "../supabaseClient";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";

type GoogleLoginScreenProp = StackNavigationProp<RootStackParamList, "Login">;

export default function GoogleLogin() {
  const navigation = useNavigation<GoogleLoginScreenProp>();

const handleGoogleLogin = async () => {
  let redirectUri: string;

  if (Platform.OS === "web") {
    redirectUri = window.location.origin;
  } else {
    redirectUri = AuthSession.makeRedirectUri({
      scheme: "plantpalmobile" // must match the "scheme" in app.json/app.config.js
    });
    // 👇 print it so you can see the exact redirect that Expo generated
    console.log("Redirect URI for this device:", redirectUri);
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: redirectUri },
  });

  if (error) {
    console.error("Login error:", error.message);
  }
};


  // ✅ Listen for auth state changes
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        console.log("Logged in user:", session.user);
        navigation.navigate("Scan"); // Navigate after successful login
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
