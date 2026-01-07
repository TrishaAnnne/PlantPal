import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../App";
import { useAuth } from "../src/contexts/AuthContext";
import * as SecureStore from 'expo-secure-store';

type SettingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Settings"
>;

export default function Settings() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { user, signOut } = useAuth();

  const [fontsLoaded] = useFonts({
    Poppins: require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
  });

  const [isPremium, setIsPremium] = useState(false);

  // 🔹 Load user premium status
  useEffect(() => {
    const loadPremiumStatus = async () => {
      if (!user?.email) return;

      const res = await fetch(
        `http://127.0.0.1:8000/api/profile/?email=${encodeURIComponent(
          user.email
        )}`
      );

      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setIsPremium(data.profile.is_premium || false);
        }
      }
    };

    loadPremiumStatus();
  }, [user]);

  // 🔹 Subscribe premium
  const handleGoPremium = async () => {
    try {
      if (!user?.email) {
        Alert.alert("Error", "User email not found");
        return;
      }

      console.log("🔔 Go Premium clicked");
      console.log("📧 Email:", user.email);

      const response = await fetch(
        "http://127.0.0.1:8000/api/subscribe_premium/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: user.email }),
        }
      );

      console.log("📡 Status:", response.status);

      const data = await response.json();
      console.log("📦 Response:", data);

      if (!response.ok) {
        Alert.alert("Error", data.error || "Failed to activate premium");
        return;
      }

      // ✅ Update UI immediately
      setIsPremium(true);

      Alert.alert(
        "🎉 Premium Activated",
        "You are now a Premium member!"
      );
    } catch (error) {
      console.error("❌ Go Premium error:", error);
      Alert.alert("Network Error", "Cannot connect to server");
    }
  };

  const handleLogout = async () => {
    try {
      // Clear saved credentials from Remember Me
      await SecureStore.deleteItemAsync('savedEmail');
      await SecureStore.deleteItemAsync('savedPassword');
      await SecureStore.deleteItemAsync('rememberMe');
      
      // Sign out - this will trigger navigation through auth state change
      await signOut();
    } catch (error) {
      console.log('Error during logout:', error);
      // Still try to logout even if clearing fails
      await signOut();
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This feature is not yet implemented.",
      [{ text: "OK" }]
    );
  };

  if (!fontsLoaded) return null;

  return (
    <ImageBackground
      source={require("../assets/background.png")}
      style={styles.bg}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
             <Ionicons name="arrow-back" size={28} color="#46811cff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Go Premium Button or Premium Badge */}
        {isPremium ? (
          <View style={styles.premiumBadge}>
            <Image 
              source={require("../assets/premium.png")} 
              style={styles.crownIcon}
            />
            <Text style={styles.premiumActive}>Premium Member</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.premiumButton} onPress={handleGoPremium}>
            <Image 
              source={require("../assets/premium.png")} 
              style={styles.crownIcon}
            />
            <Text style={styles.premiumText}>Go Premium</Text>
          </TouchableOpacity>
        )}

        {/* Email Display */}
        <View style={styles.emailCard}>
          <View style={styles.userIcon}>
            <Ionicons name="person" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.emailText}>{user?.email || "user@gmail.com"}</Text>
        </View>

        {/* Menu Items */}
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="options-outline" size={24} color="#2F4F2F" />
          <Text style={styles.menuText}>Preferences</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="headset-outline" size={24} color="#2F4F2F" />
          <Text style={styles.menuText}>Support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="lock-closed-outline" size={24} color="#2F4F2F" />
          <Text style={styles.menuText}>Privacy</Text>
        </TouchableOpacity>

        {/* Social Media Icons */}
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialIcon}>
            <Ionicons name="logo-facebook" size={28} color="#2F4F2F" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon}>
            <Ionicons name="logo-instagram" size={28} color="#2F4F2F" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon}>
            <Ionicons name="logo-twitter" size={28} color="#2F4F2F" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon}>
            <Ionicons name="globe-outline" size={28} color="#2F4F2F" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        {/* Delete Account Button */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteText}>Delete account</Text>
        </TouchableOpacity>

       
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { 
    flex: 1,
  },
  container: { 
    alignItems: "center", 
    paddingVertical: 20,
    paddingBottom: 40,
  },
  crownIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  header: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold", 
    color: "#333",
    letterSpacing: 0.2
  },
  premiumButton: {
    width: "90%",
    backgroundColor: "#FFA500",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 11,
    borderRadius: 25,
    marginBottom: 10,
  },
  premiumText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#000",
  },
  premiumBadge: {
    width: "90%",
    backgroundColor: "#FFA500",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 11,
    borderRadius: 25,
    marginBottom: 10,
  },
  premiumActive: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#000",
  },
  emailCard: {
    width: "90%",
    backgroundColor: "rgba(238, 247, 235, 0.9)",
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 0.5,
    borderColor: "#5aba5dff",
  },
  emailText: {
    fontFamily: "Poppins-Medium",
    fontSize: 15,
    color: "#2F4F2F",
    flex: 1,
  },
  menuItem: {
    width: "90%",
    backgroundColor: "rgba(236, 251, 231, 0.6)",
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderRadius: 15,
    marginBottom: 10,
  },
  menuText: {
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    marginLeft: 15,
    color: "#2F4F2F",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
    marginBottom: 30,
    gap: 18,
  },
  socialIcon: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(236, 251, 231, 0.6)",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButton: {
    width: "80%",
    backgroundColor: "#2F7D32",
    padding: 12,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 15,
  },
  logoutText: {
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    color: "#fff",
  },
  deleteButton: {
    width: "80%",
    backgroundColor: "rgba(243, 196, 196, 0.8)",
    padding: 12,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 30,
  },
  deleteText: {
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    color: "#D32F2F",
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    marginBottom: 5,
  },
  logoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 45,
    gap: 3,
  },
  logoDot: {
    width: 12,
    height: 12,
    backgroundColor: "#000",
    borderRadius: 2,
  },
  brandName: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    color: "#000",
    marginTop: 5,
  },
  versionText: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#999",
    marginTop: 10,
  },
});