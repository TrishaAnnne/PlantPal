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
import * as SecureStore from 'expo-secure-store';

type ProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Profile"
>;

export default function Profile() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, signOut } = useAuth();

  const [fontsLoaded] = useFonts({
    Poppins: require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
  });

  const [username, setUsername] = useState("Loading...");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [interests, setInterests] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  // 🔹 Load user profile
  useEffect(() => {
    const loadUser = async () => {
      if (!user?.email) return;
      setEmail(user.email);

      const res = await fetch(
        `http://127.0.0.1:8000/api/profile/?email=${encodeURIComponent(
          user.email
        )}`
      );

      if (res.ok) {
        const data = await res.json();
        setUsername(data.username);

        if (data.profile) {
          setCity(data.profile.city || "");
          setInterests(data.profile.interests || "");
          setAvatarUrl(data.profile.avatar_url || null);
          setIsPremium(data.profile.is_premium || false);
        }
      }
    };

    loadUser();
  }, [user]);

  // 🔹 Subscribe premium
  const handleGoPremium = async () => {
  try {
    if (!email) {
      Alert.alert("Error", "User email not found");
      return;
    }

    console.log("🔔 Go Premium clicked");
    console.log("📧 Email:", email);

    const response = await fetch(
      "http://127.0.0.1:8000/api/subscribe_premium/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
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
    
    await signOut();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  } catch (error) {
    console.log('Error clearing credentials:', error);
    // Still logout even if clearing fails
    await signOut();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  }
};

  if (!fontsLoaded) return null;

  return (
    <ImageBackground
      source={require("../assets/background.png")}
      style={styles.bg}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Ionicons
            name="arrow-back"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Profile</Text>
         <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <Ionicons name="settings-outline" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person-circle" size={100} color="#2F4F2F" />
          )}

          <Text style={styles.name}>{username}</Text>
          <Text style={styles.email}>{email}</Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Text style={styles.editText}>Edit profile</Text>
          </TouchableOpacity>

          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={18} />
            <Text style={styles.infoText}>
              {city || "Add your city"}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="heart-outline" size={18} />
            <Text style={styles.infoText}>
              {interests || "What are you interested in?"}
            </Text>
          </View>

          {/* PREMIUM */}
          {isPremium ? (
            <View style={styles.premiumBadge}>
               <Image 
                source={require("../assets/premium.png")} 
                style={styles.crownIcon}
              />
              <Text style={styles.premiumActive}>Premium Member</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.premiumButton}
              onPress={handleGoPremium}
            >
              <Image 
                source={require("../assets/premium.png")} 
                style={styles.crownIcon}
              />
              <Text style={styles.premiumText}>Go Premium</Text>
            </TouchableOpacity>
          )}
        </View>

   
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { alignItems: "center", paddingVertical: 40 },
  header: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
  },
  card: {
    width: "90%",
    backgroundColor: "rgba(155,184,146,0.6)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  name: { fontFamily: "Poppins-SemiBold", fontSize: 18 },
  email: { fontFamily: "Poppins", fontSize: 14 },
  editButton: { alignSelf: "flex-end" },
  editText: { textDecorationLine: "underline",  color: "#719862ff", fontFamily: "Poppins-Regular", marginBottom: 4 },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e1e9d7",
    padding: 10,
    borderRadius: 20,
    width: "100%",
    marginVertical: 5,
  },
  infoText: { marginLeft: 8 },
  premiumButton: { 
    marginTop: 10,
    backgroundColor: "#FFA500",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 20,
    width: "55%",
  },
  premiumText: { 
    fontFamily: "Poppins-SemiBold",
    color: "#000",
  },
  crownIcon: { 
    width: 20, 
    height: 20,
    marginRight: 8,
  },
  premiumBadge: {
     marginTop: 10,
    backgroundColor: "#FFA500",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 20,
    width: "70%",
  },
  premiumActive: {   fontFamily: "Poppins-SemiBold",
    color: "#000",marginLeft: 6 },
  
});