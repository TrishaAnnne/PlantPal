import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
  ImageBackground,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useAuth } from "../src/contexts/AuthContext";
import { useFonts } from "expo-font";
import { fetchAddressSuggestions } from "../src/api/address";

type Navigation = NavigationProp<any>;

const EditProfile: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const { user } = useAuth();

  const [username, setUsername] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [interest, setInterest] = useState<string>("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [email, setEmail] = useState<string>(user?.email || "");
  const [editingName, setEditingName] = useState<boolean>(false);

  // 🔍 Address search states
  const [addressQuery, setAddressQuery] = useState<string>("");
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);

  // 🔽 Interest modal
  const [showInterestModal, setShowInterestModal] = useState(false);
  const interestOptions = [
    "Plant Identification",
    "Herbal Benefits",
    "Plant Care",
    "Growth Journaling",
    "Plant Information",
    "Community Updates",
  ];

  const [fontsLoaded] = useFonts({
    Poppins: require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
  });

  // ✅ Fetch profile info when screen loads
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
      fetchProfile(user.email);
    }
  }, [user]);

  const fetchProfile = async (email: string) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/profile/?email=${email}`);
    if (!response.ok) throw new Error("Failed to fetch profile");

    const data = await response.json();
    console.log("Profile API result:", data);

    setUsername(data.username || "");
    setCity(data.profile?.city || "");
    setInterest(data.profile?.interests || "");
    setProfilePic(data.profile?.avatar_url || null);
  } catch (err: any) {
    console.log("Profile fetch error:", err.message);
  }
};


  if (!fontsLoaded) return null;

  // 📸 Photo picker
  const handleChoosePhoto = async (): Promise<void> => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ correct for your version
    allowsEditing: true,
    quality: 1,
  });

  if (!result.canceled && result.assets.length > 0) {
    setProfilePic(result.assets[0].uri);
  }
};


  // 💾 Save profile
const handleSave = async (): Promise<void> => {
  try {
    const payload = {
      email: email,
      updates: {
        user_name: username,   // 👈 backend expects user_name
        city: city,
        interests: interest,
        avatar_url: profilePic, // ⚠️ still just a URI (see note below)
      },
    };

    console.log("Saving profile payload:", payload);

    const response = await fetch("http://127.0.0.1:8000/api/update_profile/", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText);
    }

    Alert.alert("Success", "Profile updated!");
    navigation.goBack();
  } catch (err: any) {
    Alert.alert("Error", err.message);
  }
};


  return (
    <ImageBackground
      source={require("../assets/background.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2F4F2F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Card */}
        <View style={styles.card}>
          {/* Profile Picture */}
          <TouchableOpacity
            onPress={handleChoosePhoto}
            style={styles.avatarContainer}
          >
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <Ionicons name="person" size={40} color="#fff" />
              </View>
            )}
            <View style={styles.editBadge}>
              <Text style={styles.editText}>Edit</Text>
            </View>
          </TouchableOpacity>

          {/* Email */}
          <Text style={styles.email}>{email}</Text>

          {/* Username Field */}
          <View style={styles.fieldContainer}>
            {editingName ? (
              <TextInput
                style={styles.nameInput}
                value={username}
                onChangeText={setUsername}
                onBlur={() => setEditingName(false)}
                autoFocus
                placeholder="Enter your username"
                placeholderTextColor="#2F4F2F99"
              />
            ) : (
              <TouchableOpacity
                style={styles.nameDisplay}
                onPress={() => setEditingName(true)}
              >
                <Text style={styles.nameText}>
                  {username ? username : "No username set"}
                </Text>
                <View style={styles.iconButton}>
                  <Ionicons name="pencil" size={20} color="#2e7d32" />
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* City with Search */}
          <TouchableOpacity
            style={styles.dropdownField}
            onPress={() => setShowAddressModal(true)}
          >
            <Text
              style={[styles.dropdownText, !city && styles.placeholderText]}
            >
              {city || "Search your city"}
            </Text>
            <View style={styles.iconButton}>
              <Ionicons name="search" size={20} color="#2e7d32" />
            </View>
          </TouchableOpacity>

          {/* Interest Dropdown */}
          <TouchableOpacity
            style={styles.dropdownField}
            onPress={() => setShowInterestModal(true)}
          >
            <Text
              style={[styles.dropdownText, !interest && styles.placeholderText]}
            >
              {interest || "Select primary interest"}
            </Text>
            <View style={styles.iconButton}>
              <Ionicons name="chevron-down" size={20} color="#2e7d32" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Address Search Modal */}
      <Modal visible={showAddressModal} animationType="slide">
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>
            Search your city
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              padding: 10,
              borderRadius: 8,
              marginBottom: 10,
            }}
            placeholder="Type city name..."
            value={addressQuery}
            onChangeText={async (text) => {
              setAddressQuery(text);

              if (!text.trim()) {
                setAddressSuggestions([]);
                return;
              }
              const results = await fetchAddressSuggestions(text);
              setAddressSuggestions(results);
            }}
          />

          <FlatList
            data={addressSuggestions}
            keyExtractor={(item) => item.place_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ padding: 10 }}
                onPress={() => {
                  setCity(item.display_name);
                  setShowAddressModal(false);
                  setAddressSuggestions([]);
                  setAddressQuery("");
                }}
              >
                <Text>{item.display_name}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={{ marginTop: 20 }}
            onPress={() => setShowAddressModal(false)}
          >
            <Text style={{ color: "red" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ✅ Interest Picker Modal */}
      <Modal
        visible={showInterestModal}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Your Interest</Text>

            <View style={styles.interestGrid}>
              {interestOptions.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.interestButton}
                  onPress={() => {
                    setInterest(item);
                    setShowInterestModal(false);
                  }}
                >
                  <Text style={styles.interestText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setShowInterestModal(false)}
              style={{ marginTop: 15 }}
            >
              <Text style={{ color: "red", textAlign: "center" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

export default EditProfile;

// ✅ Styles
const styles = StyleSheet.create({
  bg: { flex: 1, width: "100%", height: "100%" },
  container: { flexGrow: 1, alignItems: "center", paddingVertical: 30 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 50,
    marginBottom: 20,
    alignSelf: "center",
  },
  headerTitle: { fontSize: 20, fontFamily: "Poppins-SemiBold", color: "#2F4F2F" },
  saveText: { fontSize: 16, fontFamily: "Poppins-SemiBold", color: "#4a7c59" },
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
  avatarContainer: { position: "relative", marginBottom: 15 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#4a7c59",
    justifyContent: "center",
    alignItems: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4a7c59",
  },
  editText: { fontSize: 12, fontFamily: "Poppins-Medium", color: "#4a7c59" },
  email: {
    fontSize: 14,
    fontFamily: "Poppins",
    color: "#1c2c1c",
    opacity: 0.8,
    marginBottom: 15,
  },
  fieldContainer: { width: "100%", marginBottom: 15 },
  nameDisplay: {
    backgroundColor: "#e1e9d7",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameInput: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontFamily: "Poppins",
    fontSize: 16,
    color: "#2F4F2F",
    borderWidth: 1,
    borderColor: "#4a7c59",
  },
  nameText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#2F4F2F",
    flex: 1,
  },
  dropdownField: {
    backgroundColor: "#e1e9d7",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: "Poppins",
    color: "#2F4F2F",
    flex: 1,
  },
  placeholderText: { opacity: 0.6 },
  iconButton: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: "#f1f8f4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#81c784",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#d4e6d4",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#2F4F2F",
    textAlign: "center",
    marginBottom: 20,
  },
  // 🔽 New styles for interest grid
  interestGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  interestButton: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 12,
    width: "48%",
    alignItems: "center",
  },
  interestText: {
    fontSize: 16,
    fontFamily: "Poppins",
    color: "#2F4F2F",
    textAlign: "center",
  },
});
