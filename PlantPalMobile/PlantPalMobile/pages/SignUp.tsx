import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../App";

type SignUpScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SignUp"
>;

export default function SignUp() {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins: require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Italic": require("../assets/fonts/Poppins-Italic.ttf"),
  });

  if (!fontsLoaded) return null;

  const handleSignUp = () => {
    if (!email || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    alert("Signed Up!");
  };

  // Password requirement checks
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // Strength level
  const strengthCount =
    (hasMinLength ? 1 : 0) +
    (hasNumber ? 1 : 0) +
    (hasUppercase ? 1 : 0) +
    (hasSpecialChar ? 1 : 0);

  // Missing requirement message
  let passwordHint = "";
  let passwordHintColor = "#D9534F"; // muted red by default
  if (!hasMinLength) passwordHint = "Password must be at least 8 characters";
  else if (!hasNumber) passwordHint = "Add a number to strengthen your password";
  else if (!hasUppercase)
    passwordHint = "Add an uppercase letter to strengthen your password";
  else if (!hasSpecialChar)
    passwordHint = "Add a special character to strengthen your password";
  else passwordHint = "Strong password ✔";

  return (
    <ImageBackground
      source={require("../assets/background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Logo above title */}
        <Image
          source={require("../assets/plantpal-logo.png")}
          style={styles.logo}
        />

        {/* Title */}
        <Text style={styles.title}>Sign Up</Text>
        <Text style={styles.subtitle}>
          Create your PlantPal+ account and stay{"\n"}rooted in wellness.
        </Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#5c7255ff"
            value={email}
            onChangeText={setEmail}
          />
          <View style={styles.iconCircle}>
            <Ionicons name="mail-outline" size={20} color="#5c7255ff" />
          </View>
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#5c7255ff"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#5c7255ff"
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Password Strength Lines */}
        <View style={styles.strengthContainer}>
          {[...Array(4)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.strengthBar,
                {
                  backgroundColor: i < strengthCount ? "#3B6E3B" : "#ccc",
                },
              ]}
            />
          ))}
        </View>

        {/* Password Hint */}
        {password.length > 0 && (
          <Text style={[styles.passwordHint, { color: passwordHintColor }]}>
            {passwordHint}
          </Text>
        )}


        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#5c7255ff"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <View style={styles.iconCircle}>
              <Ionicons
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#5c7255ff"
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Password mismatch error */}
        {confirmPassword.length > 0 && confirmPassword !== password && (
          <Text style={styles.errorText}>✖ Passwords do not match</Text>
        )}

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
          <Text style={styles.signupTextButton}>Sign Up</Text>
        </TouchableOpacity>

        {/* OR Divider */}
        <Text style={styles.orText}>Or</Text>

        {/* Google Sign Up */}
        <TouchableOpacity style={styles.googleButton}>
          <Image
            source={require("../assets/google-icon.png")}
            style={styles.googleIcon}
          />
          <Text style={styles.googleText}>Google</Text>
        </TouchableOpacity>

        {/* Already have an account */}
        <Text style={styles.loginText}>
          Already have an account?{" "}
          <Text
            style={styles.loginLink}
            onPress={() => navigation.navigate("Login")}
          >
            Log In
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
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginBottom: 2,                  
  },
  title: {
    fontSize: 28,
    alignSelf: "flex-start",
    fontFamily: "Poppins-SemiBold",
    color: "#2F4F2F",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Poppins",
    letterSpacing: 0.8,
    fontWeight: "600",
    color: "#555",
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e1e9d7ff",
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 20,
    width: "100%",
  },
  input: { flex: 1, padding: 10, color: "#333", fontFamily: "Poppins" },
  iconCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#FAFFEF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  strengthContainer: {
    flexDirection: "row",
    marginVertical: 5,
    marginBottom: 8,
    alignSelf: "flex-start",
    width: "100%",
  },
  strengthBar: {
    flex: 1,
    height: 4,
    marginHorizontal: 2,
    borderRadius: 2,
  },
 passwordHint: {
  fontSize: 12,
  fontFamily: "Poppins",
  marginBottom: 10,
  alignSelf: "flex-start",
  },

  signupButton: {
    backgroundColor: "#3B6E3B",
    borderRadius: 20,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },
  signupTextButton: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-Medium",
  },
  orText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#555",
    marginBottom: 15,
  },
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
  googleText: { fontSize: 16, fontFamily: "Poppins", color: "#333" },
  loginText: {
    fontSize: 14,
    fontFamily: "Poppins",
    color: "#333",
    marginBottom: 10,
  },
  loginLink: {
    color: "#4A7C59",
    fontFamily: "Poppins",
    textDecorationLine: "underline",
  },
  terms: {
    fontSize: 12,
    fontFamily: "Poppins",
    color: "#4A7C59",
    textDecorationLine: "underline",
  },
  errorText: {
    color: "#D9534F",
    fontSize: 12,
    alignSelf: "flex-start",
    marginBottom: 10,
    fontFamily: "Poppins",
  },
});
