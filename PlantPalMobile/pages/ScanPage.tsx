import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useFonts } from "expo-font";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../App";
import { useAuth } from "../src/contexts/AuthContext";

type ScanPageNavigationProp = StackNavigationProp<RootStackParamList, "Scan">;
const { width } = Dimensions.get("window");
type CameraFacing = "front" | "back";

export default function ScanPage() {
  const navigation = useNavigation<ScanPageNavigationProp>();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraFacing>("back");
  const cameraRef = useRef<CameraView>(null);

  const { signOut, accessToken } = useAuth();

  const [fontsLoaded] = useFonts({
    Poppins: require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
  });

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true, // ✅ base64 for backend
        });

        if (!accessToken) {
          Alert.alert("Error", "No access token available. Please login again.");
          return;
        }

        const response = await fetch("http://127.0.0.1:8000/api/scan_plant/", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`, // ✅ JWT token
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageBase64: photo.base64,
            scanned_at: new Date().toISOString(), // ✅ dynamic timestamp
          }),
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const result = await response.json();
        console.log("Scan saved:", result);
        Alert.alert("Plant Scanned!", `Predicted: ${result.plant_name}`);
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("Error", "Failed to scan plant");
      }
    }
  };

  const handleLogout = () => {
    signOut();
    navigation.goBack();
  };

  if (!fontsLoaded) return null;

  if (!permission) return <Text style={styles.loadingText}>Loading...</Text>;
  if (!permission.granted)
    return (
      <View style={styles.container}>
        <Text style={styles.noAccessText}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={requestPermission}>
          <Text style={styles.backButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: "#666" }]}
          onPress={handleLogout}
        >
          <Text style={styles.backButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.rightTopContainer}>
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={26} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileCircle}
              onPress={() => navigation.navigate("Profile")}
            />
          </View>
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity onPress={() => navigation.navigate("Search")}>
            <Image
              source={require("../assets/search-icon-bot.png")}
              style={styles.searchIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* 📷 Camera now triggers takePicture */}
          <TouchableOpacity onPress={takePicture}>
            <Image
              source={require("../assets/photo-camera.png")}
              style={[styles.cameraIcon, { marginHorizontal: 55 }]}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Alert.alert("Coming soon!", "Journal feature coming soon!")}
          >
            <Image
              source={require("../assets/journal-icon.png")}
              style={styles.journalIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  loadingText: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 18,
    fontFamily: "Poppins",
    color: "#333",
  },
  noAccessText: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 18,
    fontFamily: "Poppins",
    color: "#333",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#4A7C59",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    alignSelf: "center",
    marginBottom: 50,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-Medium",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  rightTopContainer: { flexDirection: "row", alignItems: "center" },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#444",
    marginLeft: 12,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 40,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  searchIcon: { width: 60, height: 60, tintColor: "#fff" },
  cameraIcon: { width: 59, height: 40, tintColor: "#fff" },
  journalIcon: { width: 50, height: 35, tintColor: "#fff" },
});
