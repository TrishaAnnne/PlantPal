import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ImageBackground,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SearchPage() {
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({
    Poppins: require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
  });

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem("searchHistory");
      if (saved) setHistory(JSON.parse(saved));
    } catch (err) {
      console.error("Error loading history:", err);
    }
  };

  const saveHistory = async (term: string) => {
    try {
      const updated = [term, ...history.filter((item) => item !== term)].slice(0, 5);
      setHistory(updated);
      await AsyncStorage.setItem("searchHistory", JSON.stringify(updated));
    } catch (err) {
      console.error("Error saving history:", err);
    }
  };

  // 🔍 Search plants from Django API
  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);

    try {
     
      const response = await fetch(`http://127.0.0.1:8000/api/search_plants/?q=${query}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      setResults(data);
      await saveHistory(query);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryPress = (term: string) => {
    setQuery(term);
    handleSearch();
  };

  if (!fontsLoaded) return null;

  return (
    <ImageBackground
      source={require("../assets/background.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#2F4F2F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Plants</Text>
          <Ionicons name="leaf-outline" size={24} color="#2F4F2F" />
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={22} color="#2F4F2F" />
          <TextInput
            style={styles.searchInput}
            placeholder="What are you looking to treat?"
            placeholderTextColor="#3d583d"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity onPress={handleSearch}>
            <Ionicons name="arrow-forward-circle" size={26} color="#2F4F2F" />
          </TouchableOpacity>
        </View>

        <View style={styles.disclaimerBox}>
          <Ionicons name="information-circle-outline" size={18} color="#2F4F2F" />
          <Text style={styles.disclaimerText}>
            Disclaimer: The medicinal and herbal uses shown are for educational and study purposes only.
            They are not intended to diagnose, treat, cure, or prevent any disease.
            Always consult a qualified healthcare professional.
          </Text>
        </View>


        {history.length > 0 && (
          <View style={styles.historyCard}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            {history.map((term, index) => (
              <TouchableOpacity key={index} style={styles.historyItem} onPress={() => handleHistoryPress(term)}>
                <Ionicons name="time-outline" size={18} color="#2F4F2F" />
                <Text style={styles.historyText}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.resultsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#2F4F2F" />
          ) : results.length > 0 ? (
            results.map((plant, index) => (
              <View key={index} style={styles.resultCard}>
        
        <TouchableOpacity
          style={{ position: "absolute", top: 10, right: 10 }}
          onPress={() => handleBookmark(plant)}
        >
          <Ionicons name="bookmark-outline" size={24} color="#2F4F2F" />
        </TouchableOpacity>

        <Ionicons name="leaf-outline" size={40} color="#2F4F2F" />

        <Text style={styles.plantName}>{plant.plant_name}</Text>

        <Text style={styles.plantDesc}>
          {plant.scientific_name || "No scientific name available"}
        </Text>

        {plant.ailments && (
          <View style={styles.usesBox}>
            <Text style={styles.usesTitle}>Herbal Uses:</Text>

            {Object.keys(plant.ailments).map((category, i) =>
              plant.ailments[category].map((item: any, j: number) => (
                <Text key={`${i}-${j}`} style={styles.usesText}>
                  • {item.ailment} – {item.herbalBenefit}
                </Text>
              ))
            )}
          </View>
          )}
          </View>

            ))
          ) : (
            query !== "" && <Text style={styles.noResultText}>No plants found.</Text>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
const handleBookmark = async (plant: any) => {
    try {
      const saved = await AsyncStorage.getItem("bookmarkedPlants");
      let bookmarks = saved ? JSON.parse(saved) : [];

      if (!bookmarks.some((p: any) => p.id === plant.id)) {
        bookmarks.push(plant);
        await AsyncStorage.setItem("bookmarkedPlants", JSON.stringify(bookmarks));
        alert(`${plant.plant_name} added to your bookmarks!`);
      } else {
        alert(`${plant.plant_name} is already bookmarked.`);
      }
    } catch (err) {
      console.error("Error bookmarking plant:", err);
    }
  };
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
  headerTitle: { fontSize: 20, fontFamily: "Poppins-SemiBold", color: "#2F4F2F" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e1e9d7",
    borderRadius: 20,
    paddingHorizontal: 15,
    width: "90%",
    height: 45,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Poppins",
    fontSize: 14,
    marginLeft: 8,
    color: "#2F4F2F",
  },
  historyCard: {
    width: "90%",
    backgroundColor: "rgba(155,184,146,0.6)",
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    color: "#2F4F2F",
    fontSize: 16,
    marginBottom: 8,
  },
  historyItem: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  historyText: { marginLeft: 8, fontFamily: "Poppins", color: "#2F4F2F", fontSize: 14 },
  resultsContainer: { width: "90%", alignItems: "center" },
  resultCard: {
    width: "100%",
    backgroundColor: "#e1e9d7",
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  plantName: { fontFamily: "Poppins-SemiBold", fontSize: 16, color: "#1c2c1c", marginBottom: 5 },
  plantDesc: { fontFamily: "Poppins", fontSize: 13, color: "#2F4F2F", textAlign: "center" },
  noResultText: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#2F4F2F",
    textAlign: "center",
    marginTop: 10,
  },
  usesBox: {
  marginTop: 8,
  width: "100%",
  },

  usesTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: "#1c2c1c",
    marginBottom: 4,
  },

  usesText: {
    fontFamily: "Poppins",
    fontSize: 13,
    color: "#2F4F2F",
    marginBottom: 2,
  },

  disclaimerBox: {
    flexDirection: "row",
    width: "90%",
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 12,
    borderRadius: 15,
    marginTop: 20,
  },

  disclaimerText: {
    marginLeft: 8,
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#2F4F2F",
    flex: 1,
  },

});
