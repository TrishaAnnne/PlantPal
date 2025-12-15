import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";



export default function JournalPage() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("plants");
  const [open, setOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const plantData = [
    {
      id: 1,
      name: "Asthma Plant",
      image: require("../assets/asthma_plant.jpg"),
    },
    {
      id: 2,
      name: "Bitter Gourd",
      image: require("../assets/sambong1.jpg"),
    },
    {
      id: 3,
      name: "Five-Leaved Chaste Tree",
     image: require("../assets/sambong1.jpg"),
    },
  ];

  const notesData = [
    {
      id: 1,
      date: "Sat, Feb 27 • Today",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nulla at dictum rutrum.",
    },
    {
      id: 2,
      date: "Sat, Feb 27 • Today",
      text: "Vivamus non nisi dignissim, iaculis nulla at, cursus est. Integer quis vehicula justo.",
    },
    {
      id: 3,
      date: "Sat, Feb 27 • Today",
      text: "Pellentesque vel metus vel leo rhoncus malesuada.",
    },
  ];

  // Floating button animation
  const toggleMenu = () => {
    const toValue = open ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 5,
      useNativeDriver: true,
    }).start();
    setOpen(!open);
  };

  const imageStyle = {
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -70],
        }),
      },
    ],
    opacity: animation,
  };

  const noteStyle = {
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -140],
        }),
      },
    ],
    opacity: animation,
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#4A6049" />
        </TouchableOpacity>

        <Text style={styles.title}>My Journal</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "plants" && styles.activeTab]}
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
          style={[styles.tab, activeTab === "notes" && styles.activeTab]}
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

      {/* Scroll Content */}
      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {activeTab === "plants" ? (
          <View>
            {plantData.map((plant) => (
              <TouchableOpacity
                key={plant.id}
                style={styles.card}
                onPress={() => console.log(`Clicked ${plant.name}`)}
              >
                <Image source={plant.image} style={styles.image} />
                <View style={styles.overlay} />
                <Text style={styles.cardText}>{plant.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View>
            {notesData.map((note) => (
              <View key={note.id} style={styles.noteCard}>
                <Text style={styles.noteDate}>{note.date}</Text>
                <Text style={styles.noteText}>{note.text}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Buttons */}
      <View style={styles.fabContainer}>
        {/* Small note button */}
        <Animated.View style={[styles.secondaryButton, noteStyle]}>
          <TouchableOpacity onPress={() => console.log("Add Note pressed")}>
            <Ionicons name="create-outline" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </Animated.View>

        {/* Small image button */}
        <Animated.View style={[styles.secondaryButton, imageStyle]}>
          <TouchableOpacity onPress={() => console.log("Add Image pressed")}>
            <Ionicons name="image-outline" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </Animated.View>

        {/* Main + button */}
        <TouchableOpacity style={styles.mainButton} onPress={toggleMenu}>
          <Ionicons name={open ? "close" : "add"} size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F6EE" },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    position: "relative",
  },

  backButton: {
    position: "absolute",
    left: 20,
    top: 50,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4A6049",
    textAlign: "center",
  },

  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: "#E5ECD5",
    borderRadius: 20,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
  },
  activeTab: {
    backgroundColor: "#A8C686",
  },
  tabText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#6A7F61",
  },
  activeTabText: {
    color: "#fff",
  },

  scrollArea: {
    marginTop: 15,
    paddingHorizontal: 20,
  },

  // --- Plants ---
  card: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: "hidden",
    height: 140,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  cardText: {
    position: "absolute",
    bottom: 10,
    left: 15,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // --- Notes ---
  noteCard: {
    backgroundColor: "#E5ECD5",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  noteDate: {
    fontWeight: "700",
    color: "#6A7F61",
    marginBottom: 5,
  },
  noteText: {
    color: "#4A6049",
    lineHeight: 20,
  },

  // --- Floating Buttons ---
  fabContainer: {
    position: "absolute",
    bottom: 30,
    right: 30,
    alignItems: "center",
  },
  mainButton: {
    backgroundColor: "#4CAF50",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  secondaryButton: {
    position: "absolute",
    backgroundColor: "#fff",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
});