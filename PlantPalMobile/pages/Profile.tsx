import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../App";
import { useAuth } from "../src/contexts/AuthContext";

type ProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Profile"
>;

export default function Profile() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, signOut } = useAuth(); // user contains { email }

  const [fontsLoaded] = useFonts({
    Poppins: require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
  });

  // --- State ---
  const [username, setUsername] = useState("Loading...");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [interests, setInterests] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // --- Load user info from backend ---
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!user?.email) {
          console.warn("No email found in AuthContext");
          return;
        }
        setEmail(user.email);

        const res = await fetch(
          `http://127.0.0.1:8000/api/profile/?email=${encodeURIComponent(
            user.email
          )}`
        );

        if (res.ok) {
          const data = await res.json();
          if (data.username) setUsername(data.username);
          if (data.profile) {
            setCity(data.profile.city || "");
            setInterests(data.profile.interests || "");
            setAvatarUrl(data.profile.avatar_url || null); // ✅ avatar
          }
        } else {
          console.warn("Profile API error", await res.text());
        }
      } catch (err) {
        console.error("Error loading user:", err);
      }
    };
    loadUser();
  }, [user]);

  // --- Log out ---
  const handleLogout = async () => {
    try {
      await signOut();
      Alert.alert("Logged out", "You have been logged out.", [
        { text: "OK", onPress: () => navigation.replace("Login") },
      ]);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <ImageBackground
      source={require("../assets/background.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#2F4F2F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={24} color="#2F4F2F" />
          </TouchableOpacity>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <Ionicons
              name="person-circle"
              size={100}
              color="#2F4F2F"
              style={styles.avatarIcon}
            />
          )}

          <Text style={styles.name}>{username}</Text>
          <Text style={styles.email}>{email}</Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Text style={styles.editText}>Edit profile</Text>
          </TouchableOpacity>

          {/* Info fields */}
          <View style={styles.infoRow}>
            <TouchableOpacity style={styles.infoItem}>
              <Ionicons name="location-outline" size={18} color="#2F4F2F" />
              <Text style={styles.infoText}>
                {city ? city : "Add your city"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoItem}>
              <Ionicons name="heart-outline" size={18} color="#2F4F2F" />
              <Text style={styles.infoText}>
                {interests ? interests : "What are you interested in?"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Go Premium Button */}
          <TouchableOpacity style={styles.premiumButton}>
            <ImageBackground
              source={require("../assets/gold-bg.png")}
              style={styles.premiumBg}
              imageStyle={{ borderRadius: 20 }}
              resizeMode="stretch"
            >
              <View style={styles.premiumContent}>
                <Text style={styles.premiumText}>Go Premium</Text>
                <Image
                  source={require("../assets/crown.png")}
                  style={styles.crownIcon}
                  resizeMode="contain"
                />
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* Log out */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: "100%", height: "100%" },
  container: { flexGrow: 1, alignItems: "center", paddingVertical: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: "#2F4F2F",
  },
  card: {
    width: "90%",
    backgroundColor: "rgba(155,184,146,0.6)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarIcon: { marginBottom: 15 },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  name: { fontSize: 18, fontFamily: "Poppins-SemiBold", color: "#1c2c1c" },
  email: {
    fontSize: 14,
    fontFamily: "Poppins",
    color: "#1c2c1c",
    marginBottom: 10,
  },
  editButton: { alignSelf: "flex-end", marginRight: 10, marginBottom: 10 },
  editText: {
    fontFamily: "Poppins-Medium",
    color: "#1c5e2e",
    textDecorationLine: "underline",
  },
  infoRow: { width: "100%", marginBottom: 20 },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e1e9d7",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "Poppins",
    color: "#2F4F2F",
  },
  premiumButton: { borderRadius: 20, overflow: "hidden", marginTop: 10 },
  premiumBg: { paddingVertical: 10, paddingHorizontal: 30 },
  premiumContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  premiumText: {
    fontFamily: "Poppins-SemiBold",
    color: "#000",
    fontSize: 16,
    marginRight: 8,
  },
  crownIcon: { width: 20, height: 20 },
  logoutButton: {
    marginTop: 30,
    backgroundColor: "#9bb892",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  logoutText: {
    fontFamily: "Poppins-Medium",
    color: "#fff",
    fontSize: 16,
  },
});