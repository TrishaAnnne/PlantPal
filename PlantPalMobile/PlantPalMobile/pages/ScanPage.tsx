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
import { Ionicons } from "@expo/vector-icons"; // ✅ for back button

const { width } = Dimensions.get("window");

type CameraFacing = "front" | "back";

export default function ScanPage() {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraFacing>("back");
  const cameraRef = useRef<CameraView>(null);

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
          base64: false,
        });
        console.log("Photo taken:", photo.uri);
        Alert.alert("Photo Captured!", "Plant scan complete!");
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("Error", "Failed to take picture");
      }
    }
  };

  if (!fontsLoaded) return null;

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!permission.granted) {
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
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
       {/* Top Bar */}
<View style={styles.topBar}>
  {/* Left - Back button */}
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Ionicons name="chevron-back" size={28} color="#fff" />
  </TouchableOpacity>

  {/* Right - Notification + Avatar */}
  <View style={styles.rightTopContainer}>
    <TouchableOpacity>
      <Ionicons name="notifications-outline" size={26} color="#fff" /> 
      {/* You can also use "notifications" for filled style */}
    </TouchableOpacity>
    <TouchableOpacity style={styles.profileCircle} />
  </View>
</View>


     {/* Bottom main controls row */}
<View style={styles.bottomControls}>
  {/* Capture button centered absolutely */}
  <TouchableOpacity onPress={takePicture} style={styles.captureButton} />

  {/* Right icon */}
  <TouchableOpacity style={styles.rightIconWrapper}>
    <Image
      source={require("../assets/search-image-icon.png")}
      style={styles.bottomIcon}
      resizeMode="contain"
    />
  </TouchableOpacity>
</View>


     {/* Row of 3 smaller icons BELOW */}
<View style={styles.bottomBar}>
  <TouchableOpacity>
    <Image
      source={require("../assets/search-icon-bot.png")}
      style={styles.searchIcon}   // 👈 unique style
      resizeMode="contain"
    />
  </TouchableOpacity>

  <TouchableOpacity>
    <Image
      source={require("../assets/photo-camera.png")}
      style={[styles.cameraIcon, { marginHorizontal: 55 }]}  // 👈 unique style
      resizeMode="contain"
    />
  </TouchableOpacity>

  <TouchableOpacity>
    <Image
      source={require("../assets/journal-icon.png")}
      style={styles.journalIcon}  // 👈 unique style
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

  // --- Top Bar ---
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  topIcon: { width: 20, height: 20, tintColor: "#fff" },
  rightTopContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#444", // Placeholder for avatar
    marginLeft: 12,
  },

  // --- Main Bottom Controls ---
  bottomControls: {
  position: "absolute",
  bottom: 100,
  left: 0,
  right: 0,
  flexDirection: "row",
  justifyContent: "center", // ✅ capture button stays centered
  alignItems: "center",
  },
  rightIconWrapper: {
  position: "absolute",
  right: 60, // ✅ adjust distance from right edge
  bottom: 15, // aligns nicely with capture button
},
  bottomIcon: {
    width: 32,
    height: 32,
    tintColor: "#fff",
    marginLeft: 20,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.6)",
  },

  // --- 3 small icons row ---
bottomBar: {
  position: "absolute",
  bottom: 0, // ✅ stick to very bottom
  left: 0,
  right: 0,
  height: 80, // ✅ gives it some height
  backgroundColor: "rgba(0,0,0,0.5)", // ✅ semi-transparent black
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  paddingHorizontal: 40,
  borderTopLeftRadius: 16, // optional, smooth edges
  borderTopRightRadius: 16, // optional
},

searchIcon: { width: 60, height: 60, tintColor: "#fff" },   // smaller
cameraIcon: { width: 59, height: 40, tintColor: "#fff" },   // medium
journalIcon: { width: 50, height: 35, tintColor: "#fff" },  // in-between

  
});