              // Login.tsx
              import React, { useState } from "react";
              import {
                StyleSheet,
                View,
                Text,
                TextInput,
                TouchableOpacity,
                ImageBackground,
                Alert,
                ActivityIndicator,
              } from "react-native";
              import { Ionicons } from "@expo/vector-icons";
              import Checkbox from "expo-checkbox";
              import { useFonts } from "expo-font";
              import { useNavigation } from "@react-navigation/native";
              import { StackNavigationProp } from "@react-navigation/stack";
              import { RootStackParamList } from "../App";
              import { useAuth } from "../src/contexts/AuthContext"; // ✅ import context
              import GoogleLogin from "../src/components/GoogleLogin";

              type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, "Login">;

              export default function Login() {
                const navigation = useNavigation<LoginScreenNavigationProp>();

                // ✅ Pull setUser from AuthContext (not session)
                const { user, setUser } = useAuth();

                const [email, setEmail] = useState("");
                const [password, setPassword] = useState("");
                const [secureText, setSecureText] = useState(true);
                const [remember, setRemember] = useState(false);
                const [loading, setLoading] = useState(false);

                const [fontsLoaded] = useFonts({
                  Poppins: require("../assets/fonts/Poppins-Regular.ttf"),
                  "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
                  "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
                  "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
                  "Poppins-Italic": require("../assets/fonts/Poppins-Italic.ttf"),
                });

                if (!fontsLoaded) return null;

             const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert("Missing fields", "Please enter both email and password.");
    return;
  }

  setLoading(true);
  try {
    console.log("Attempting login with:", { email, password });

    const response = await fetch("http://127.0.0.1:8000/api/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      Alert.alert("Login failed", result.error || "Invalid email or password.");
      return;
    }

    console.log("Login successful!", result);

    // ✅ Await the async context update
    await setUser(
      { email: result.user.email },
      result.access,
      result.refresh
    );

    // AppNavigator should auto-switch if using AuthContext.user
  } catch (err) {
    console.error("Unexpected error:", err);
    Alert.alert("Error", "Could not connect to the server.");
  } finally {
    setLoading(false);
  }
};


                return (
                  <ImageBackground
                    source={require("../assets/background.png")}
                    style={styles.background}
                    resizeMode="cover"
                  >
                    <View style={styles.container}>
                      <Text style={styles.title}>Login</Text>
                      <Text style={styles.subtitle}>
                        Log in to PlantPal+ and keep growing{"\n"}your herbal knowledge and
                        wellness{"\n"}journey.
                      </Text>

                      {/* Email */}
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.input}
                          placeholder="Email"
                          placeholderTextColor="#5c7255ff"
                          value={email}
                          onChangeText={setEmail}
                          autoCapitalize="none"
                          keyboardType="email-address"
                        />
                        <View style={styles.iconCircle}>
                          <Ionicons name="mail-outline" size={20} color="#5c7255ff" />
                        </View>
                      </View>

                      {/* Password */}
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.input}
                          placeholder="Password"
                          placeholderTextColor="#5c7255ff"
                          secureTextEntry={secureText}
                          value={password}
                          onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                          <View style={styles.iconCircle}>
                            <Ionicons
                              name={secureText ? "eye-off-outline" : "eye-outline"}
                              size={20}
                              color="#5c7255ff"
                            />
                          </View>
                        </TouchableOpacity>
                      </View>

                      {/* Remember Me + Forgot Password */}
                      <View style={styles.row}>
                        <View style={styles.rememberContainer}>
                          <Checkbox
                            value={remember}
                            onValueChange={setRemember}
                            color={remember ? "#4A7C59" : "#fff"}
                            style={{
                              width: 16,
                              height: 16,
                              transform: [{ scale: 0.9 }],
                              backgroundColor: "#fff",
                            }}
                          />
                          <Text style={styles.remember}>Remember Me</Text>
                        </View>
                        <TouchableOpacity>
                          <Text style={styles.forgot}>Forgot Password</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Login Button */}
                      <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.loginText}>Login</Text>
                        )}
                      </TouchableOpacity>

                      {/* OR Divider */}
                      <Text style={styles.orText}>Or</Text>

                      {/* Google Button */}
                      <GoogleLogin />

                      {/* Sign Up */}
                      <Text style={styles.signupText}>
                        Do not have an account yet?{" "}
                        <Text
                          style={styles.signupLink}
                          onPress={() => navigation.navigate("SignUp")}
                        >
                          Sign Up
                        </Text>
                      </Text>

                      {/* Terms */}
                      <TouchableOpacity>
                        <Text style={styles.terms}>Terms and Conditions</Text>
                      </TouchableOpacity>
                    </View>
                  </ImageBackground>
                );
              }



              const styles = StyleSheet.create({
                background: { flex: 1, justifyContent: "center", alignItems: "center" },
                container: {
                  width: "90%",
                  borderRadius: 20,
                  padding: 20,
                  alignItems: "center",
                },
                iconCircle: {
                  width: 35,
                  height: 35,
                  borderRadius: 18,
                  backgroundColor: "#FAFFEF",
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 8,
                },
                title: {
                  fontSize: 28,
                  alignSelf: "flex-start",
                  fontFamily: "Poppins-SemiBold",
                  color: "#2F4F2F",
                  marginBottom: 8,
                },
                subtitle: {
                  fontSize: 12,
                  fontFamily: "Poppins",
                  letterSpacing: 0.8,
                  fontWeight: "600",
                  color: "#555",
                  alignSelf: "flex-start",
                  marginBottom: 30,
                },
                inputContainer: {
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#e1e9d7ff",
                  borderRadius: 25,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  marginBottom: 15,
                  width: "100%",
                },
                input: { flex: 1, padding: 10, color: "#333", fontFamily: "Poppins" },
                row: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 25, alignItems: "center" },
                rememberContainer: { flexDirection: "row", alignItems: "center" },
                remember: { fontSize: 13, fontFamily: "Poppins", color: "#333", marginLeft: 8 },
                forgot: { fontSize: 12, fontFamily: "Poppins-Italic", color: "#579755ff", textDecorationLine: "underline" },
                loginButton: { backgroundColor: "#3B6E3B", borderRadius: 20, paddingVertical: 12, width: "100%", alignItems: "center", marginBottom: 15 },
                loginText: { color: "#fff", fontSize: 16, fontFamily: "Poppins-Medium" },
                orText: { fontSize: 14, fontFamily: "Poppins-Medium", color: "#555", marginBottom: 15 },
                signupText: { fontSize: 14, fontFamily: "Poppins", color: "#333", marginBottom: 10 },
                signupLink: { color: "#4A7C59", fontFamily: "Poppins", textDecorationLine: "underline" },
                terms: { fontSize: 12, fontFamily: "Poppins", color: "#4A7C59", textDecorationLine: "underline" },
              });
