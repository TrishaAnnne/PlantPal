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
            placeholder="Search plant name..."
            placeholderTextColor="#3d583d"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity onPress={handleSearch}>
            <Ionicons name="arrow-forward-circle" size={26} color="#2F4F2F" />
          </TouchableOpacity>
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
                <Ionicons name="leaf-outline" size={50} color="#2F4F2F" />
                <Text style={styles.plantName}>{plant.plant_name}</Text>
                <Text style={styles.plantDesc} numberOfLines={2}>
                  {plant.scientific_name || "No scientific name available"}
                </Text>
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
});
