        import React, { useState, useRef } from "react";
        import {
          StyleSheet,
          View,
          Text,
          TouchableOpacity,
          Alert,
          Dimensions,
          Image,
          ActivityIndicator,
          Platform,
        } from "react-native";
        import { CameraView, useCameraPermissions } from "expo-camera";
        import { useFonts } from "expo-font";
        import { useNavigation } from "@react-navigation/native";
        import { Ionicons } from "@expo/vector-icons";
        import { StackNavigationProp } from "@react-navigation/stack";
        import { RootStackParamList } from "../App";
        import { useAuth } from "../src/contexts/AuthContext";
        import * as ImageManipulator from 'expo-image-manipulator';

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

          const [loading, setLoading] = useState(false);
          const [capturedImage, setCapturedImage] = useState<string | null>(null);
          const [result, setResult] = useState<string | null>(null);

          const BACKEND_URL = "http://127.0.0.1:8000/api/predict_plant/"; // ✅ Changed to match backend endpoint

          const takePicture = async () => {
          // Handle web platform (Camera API not fully supported)
          if (Platform.OS === "web") {
            Alert.alert(
              "Web Testing",
              "Camera capture isn't supported on Expo Web. Use mobile or send a test image instead."
            );
            return;
          }

          if (!cameraRef.current) {
            Alert.alert("Error", "Camera not ready yet.");
            return;
          }

          try {
            setLoading(true);

            // ✅ Capture photo with base64
            const photo = await cameraRef.current.takePictureAsync({
              quality: 0.8,
              base64: true,
            });

            if (!photo.base64) {
              Alert.alert("Error", "No image captured. Try again.");
              return;
            }

            // ✅ Resize image before sending to backend (max 512x512)
            const resized = await ImageManipulator.manipulateAsync(
              photo.uri,
              [{ resize: { width: 512, height: 512 } }],
              { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
            );

            if (!resized.base64) {
              Alert.alert("Error", "Failed to process image. Try again.");
              return;
            }

            setCapturedImage(`data:image/jpeg;base64,${resized.base64}`);

            if (!accessToken) {
              Alert.alert("Error", "No access token available. Please login again.");
              return;
            }

            console.log("[DEBUG] Sending image to:", BACKEND_URL);
            console.log("[DEBUG] Token exists:", !!accessToken);

            // ✅ Send resized base64 to backend
            const response = await fetch(BACKEND_URL, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                image: resized.base64,
              }),
            });

            console.log("[DEBUG] Response status:", response.status);

            // ✅ Debug: raw text
            const responseText = await response.text();
            console.log(
              "[DEBUG] Raw response (first 500 chars):",
              responseText.substring(0, 500)
            );

            // ✅ Parse JSON safely
            let data;
            try {
              data = JSON.parse(responseText);
            } catch (parseError) {
              console.error("[ERROR] Failed to parse JSON:", parseError);
              console.error("[ERROR] Full response:", responseText);
              throw new Error(
                "Server returned invalid response. Check if backend is running."
              );
            }

            console.log("[DEBUG] Parsed data:", data);      

            if (!response.ok) throw new Error(data.error || "Prediction failed");

            setResult(data.plant_name);
            Alert.alert("Plant Identified 🌿", `Predicted: ${data.plant_name}`);
          } catch (error: any) {
            console.error("Error scanning plant:", error);
            Alert.alert("Error", error.message || "Failed to scan plant");
          } finally {
            setLoading(false);
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
              {Platform.OS === "web" ? (
                // ✅ Web fallback UI
                <View style={styles.webPlaceholder}>
                  <Ionicons name="camera-outline" size={80} color="#666" style={{ marginBottom: 20 }} />
                  <Text style={styles.webNotice}>
                    📷 Camera not supported on web preview.
                  </Text>
                  <Text style={styles.webSubtext}>
                    Please use a mobile device or emulator to test camera features.
                  </Text>
                  <TouchableOpacity 
                    style={styles.webMockButton}
                    onPress={() => Alert.alert("Web Mode", "Camera is disabled on web builds. Deploy to mobile to test scanning.")}
                  >
                    <Text style={styles.webButtonText}>Learn More</Text>
                  </TouchableOpacity>

                  {/* Web navigation buttons */}
                  <View style={styles.webNavButtons}>
                    <TouchableOpacity 
                      style={styles.webNavBtn}
                      onPress={() => navigation.navigate("Search")}
                    >
                      <Text style={styles.webNavBtnText}>Go to Search</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.webNavBtn}
                      onPress={() => navigation.navigate("Profile")}
                    >
                      <Text style={styles.webNavBtnText}>Go to Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.webNavBtn, { backgroundColor: "#666" }]}
                      onPress={handleLogout}
                    >
                      <Text style={styles.webNavBtnText}>Logout</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                // ✅ Mobile camera UI
                <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
                  {/* Top bar */}
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

                  {/* Bottom bar */}
                  <View style={styles.bottomBar}>
                    <TouchableOpacity onPress={() => navigation.navigate("Search")}>
                      <Image
                        source={require("../assets/search-icon-bot.png")}
                        style={styles.searchIcon}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={takePicture} disabled={loading}>
                      {loading ? (
                        <ActivityIndicator size="large" color="#fff" />
                      ) : (
                        <Image
                          source={require("../assets/photo-camera.png")}
                          style={[styles.cameraIcon, { marginHorizontal: 55 }]}
                          resizeMode="contain"
                        />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                     onPress={() => navigation.navigate("Journal")}>
                      <Image
                        source={require("../assets/journal-icon.png")}
                        style={styles.journalIcon}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                </CameraView>
              )}

              {/* Result thumbnail (only shows on mobile after capture) */}
              {capturedImage && Platform.OS !== "web" && (
                <View style={styles.resultContainer}>
                  <Image
                    source={{ uri: capturedImage }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                  {result && (
                    <Text style={styles.resultText}>Predicted: {result}</Text>
                  )}
                </View>
              )}
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
          resultContainer: {
            position: "absolute",
            bottom: 100,
            alignSelf: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.6)",
            borderRadius: 10,
            padding: 10,
          },
          previewImage: {
            width: width * 0.4,
            height: width * 0.4,
            borderRadius: 8,
          },
          resultText: {
            color: "#fff",
            fontSize: 16,
            fontFamily: "Poppins-SemiBold",
            marginTop: 8,
          },
          // ✅ Web fallback styles
          webPlaceholder: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#111",
            padding: 20,
          },
          webNotice: {
            color: "#fff",
            fontSize: 20,
            fontFamily: "Poppins-SemiBold",
            textAlign: "center",
            marginBottom: 8,
          },
          webSubtext: {
            color: "#999",
            fontSize: 14,
            fontFamily: "Poppins",
            textAlign: "center",
            marginBottom: 30,
          },
          webMockButton: {
            backgroundColor: "#4A7C59",
            paddingHorizontal: 30,
            paddingVertical: 12,
            borderRadius: 25,
            marginBottom: 40,
          },
          webButtonText: {
            color: "#fff",
            fontSize: 16,
            fontFamily: "Poppins-SemiBold",
          },
          webNavButtons: {
            width: "100%",
            maxWidth: 300,
            gap: 10,
          },
          webNavBtn: {
            backgroundColor: "#4A7C59",
            paddingVertical: 12,
            borderRadius: 25,
            alignItems: "center",
          },
          webNavBtnText: {
            color: "#fff",
            fontSize: 14,
            fontFamily: "Poppins-Medium",
          },
        });