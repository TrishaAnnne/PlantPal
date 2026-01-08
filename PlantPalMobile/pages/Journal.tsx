import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useFonts } from "expo-font";

export default function JournalPage() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<"plants" | "notes">("plants");

  const [fontsLoaded] = useFonts({
    Poppins: require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
  });

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
          <Text style={styles.headerTitle}>My Journal</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "plants" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("plants")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "plants" && styles.activeTabText,
              ]}
            >
              My Plants
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "notes" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("notes")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "notes" && styles.activeTabText,
              ]}
            >
              My Notes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === "plants" ? (
          <View style={styles.cardContainer}>
            <JournalCard
              image={require("../assets/asthma.jpg")}
              title="Asthma Plant"
            />
            <JournalCard
              image={require("../assets/bittergourd.jpg")}
              title="Bitter Gourd"
            />
            <JournalCard
              image={require("../assets/chaste.jpg")}
              title="Five-Leaved Chaste Tree"
            />
          </View>
        ) : (
          <View style={styles.notesBox}>
            <Text style={styles.emptyText}>
              No notes yet. Start writing your herbal journal 🌿
            </Text>
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
}

/* Plant Card Component */
function JournalCard({ image, title }: any) {
  return (
    <View style={styles.card}>
      <Image source={image} style={styles.cardImage} />
      <View style={styles.overlay}>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    paddingVertical: 40,
    alignItems: "center",
  },

  header: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  headerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
    color: "#2F4F2F",
  },

  tabs: {
    flexDirection: "row",
    width: "90%",
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#4f7f52",
  },
  tabText: {
    fontFamily: "Poppins",
    color: "#6b8e6b",
  },
  activeTabText: {
    color: "#4f7f52",
    fontFamily: "Poppins-SemiBold",
  },

  cardContainer: {
    width: "90%",
  },

  card: {
    height: 140,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 15,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  cardTitle: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },

  notesBox: {
    width: "90%",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: "Poppins",
    color: "#2F4F2F",
    textAlign: "center",
  },
});
