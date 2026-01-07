import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useNavigation, useRoute } from "@react-navigation/native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// API Configuration
const BASE_URL =
  Platform.OS === "android"
    ? "http://127.0.0.1:8000"
    : "http://localhost:8000";

// Types
interface Ailment {
  ailment: string;
  reference?: string;
  herbalBenefit?: string;
}

interface PlantDetails {
  id: string;
  plant_name: string;
  scientific_name: string;
  common_names?: string[] | string;
  plant_type?: string;
  images?: string[];
  ailments?: Record<string, Ailment[]>;
  kingdom?: string;
  order?: string;
  family?: string;
  genus?: string;
  origin?: string;
  distribution?: string;
  habitat?: string;
}

// Category Colors
const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  Circulatory: { bg: "#fce8e8", text: "#9b4444", border: "#e8b8b8" },
  Digestive: { bg: "#e8f5e8", text: "#4a7c4a", border: "#c8e5c8" },
  Excretory: { bg: "#e6f7f5", text: "#4a7c78", border: "#c6e7e5" },
  Eye: { bg: "#e6f4f8", text: "#4a7088", border: "#c6e4f0" },
  Immunity: { bg: "#f0e8f5", text: "#7a4a88", border: "#d8c8e5" },
  Inflammations: { bg: "#e8f5ed", text: "#4a8060", border: "#c8e5d8" },
  "Insect bites": { bg: "#f5f5e6", text: "#7c7c4a", border: "#e5e5c6" },
  Musculoskeletal: { bg: "#f5f0e6", text: "#8c7050", border: "#e5d8c6" },
  Nervous: { bg: "#e8ebf5", text: "#4a5488", border: "#c8cee5" },
  Oral: { bg: "#f5e8f0", text: "#88547a", border: "#e5c8d8" },
  Parasitic: { bg: "#f5f3e6", text: "#8c8350", border: "#e5dfc6" },
  Reproductive: { bg: "#f8e8eb", text: "#88505a", border: "#e8c8ce" },
  Respiratory: { bg: "#e8eef8", text: "#4a6088", border: "#c8d8f0" },
  Skin: { bg: "#f8e8f0", text: "#88506b", border: "#e8c8d8" },
};

// Ailment to Category Mapping
const ailmentOptions: Record<string, string[]> = {
  Digestive: ["Constipation", "Ulcer", "Diarrhea", "Indigestion", "Laxative", "Nausea", "Stomachache"],
  Skin: ["Cuts", "Wound", "Boils", "Rashes", "Eczema", "Animal Bites", "Insect Bites", "Acne", "Burns"],
  Respiratory: ["Cough", "Cold", "Asthma", "Flu", "Sore throat", "Bronchitis"],
  Immunity: ["Fever", "Allergy", "Hair loss", "Antioxidant", "Fatigue"],
  Reproductive: ["Dysmenorrhea", "Pregnancy", "Aphrodisiac", "Infertility"],
  Parasitic: ["Ringworm", "Amoebiasis", "Anti-parasitic", "Malaria"],
  Nervous: ["Headache", "Migraine", "Anxiety", "Insomnia", "Epilepsy", "Nervous Tension"],
  Excretory: ["Kidney Stones", "Urinary Tract Infection", "Diuretic", "Bladder Infection"],
  Eye: ["Eye Infection", "Conjunctivitis", "Sore Eyes", "Vision Problems"],
  Musculoskeletal: ["Arthritis", "Rheumatism", "Joint Pain", "Back Pain", "Muscle Cramps"],
  Inflammations: ["Swelling", "Pain Relief", "Anti-inflammatory", "Inflammation"],
  Oral: ["Toothache", "Gum Disease", "Mouth Ulcer", "Sore Throat"],
  Circulatory: ["Hypertension", "High Cholesterol", "Anemia", "Hematoma"],
};

// Helper function to get category for an ailment
const getCategoryForAilment = (ailment: string): string | null => {
  for (const [category, ailments] of Object.entries(ailmentOptions)) {
    if (ailments.includes(ailment)) {
      return category;
    }
  }
  return null;
};

export default function PlantDetailsPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const { plantId } = route.params as { plantId: string };
  const scrollViewRef = useRef<ScrollView>(null);

  const [fontsLoaded] = useFonts({
    Poppins: require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
  });

  const [plant, setPlant] = useState<PlantDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAilment, setSelectedAilment] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

  useEffect(() => {
    loadPlantDetails();
  }, [plantId]);

  const loadPlantDetails = async () => {
    try {
      setLoading(true);
      const url = `${BASE_URL}/api/plants/${plantId}/`;
      console.log("📡 Fetching plant details:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Plant details:", data);
        setPlant(data);

        // Auto-select first category
        if (data.ailments && Object.keys(data.ailments).length > 0) {
          const firstAilment = data.ailments[Object.keys(data.ailments)[0]]?.[0]?.ailment;
          if (firstAilment) {
            const firstCategory = getCategoryForAilment(firstAilment);
            setSelectedCategory(firstCategory);
            setSelectedAilment(firstAilment);
          }
        }
      } else {
        Alert.alert("Error", "Failed to load plant details");
      }
    } catch (error) {
      console.error("❌ Error loading plant:", error);
      Alert.alert("Connection Error", "Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleReferenceLink = (url?: string) => {
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert("Error", "Cannot open reference link");
      });
    }
  };

  const handleViewImage = () => {
    setIsImageViewerVisible(true);
  };

  const closeImageViewer = () => {
    setIsImageViewerVisible(false);
  };

  const handleImageScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SCREEN_WIDTH);
    setCurrentImageIndex(index);
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F4F2F" />
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Plant not found</Text>
      </View>
    );
  }

  const images = plant.images && plant.images.length > 0 ? plant.images : [];

  // Get all unique categories from ailments
  const availableCategories: string[] = [];
  
  if (plant.ailments) {
    Object.entries(plant.ailments).forEach(([_, ailmentArray]) => {
      ailmentArray.forEach((ailmentObj) => {
        const category = getCategoryForAilment(ailmentObj.ailment);
        if (category && !availableCategories.includes(category)) {
          availableCategories.push(category);
        }
      });
    });
  }

  // Get ailments for the selected category
  const ailmentsForSelectedCategory: Array<{
    name: string;
    data: Ailment;
  }> = [];

  if (plant.ailments && selectedCategory) {
    Object.entries(plant.ailments).forEach(([_, ailmentArray]) => {
      ailmentArray.forEach((ailmentObj) => {
        const category = getCategoryForAilment(ailmentObj.ailment);
        if (category === selectedCategory) {
          ailmentsForSelectedCategory.push({
            name: ailmentObj.ailment,
            data: ailmentObj
          });
        }
      });
    });
  }

  // Parse common names
  let commonNamesArray: string[] = [];
  
  if (plant.common_names) {
    if (Array.isArray(plant.common_names)) {
      commonNamesArray = plant.common_names;
    } else if (typeof plant.common_names === 'string') {
      commonNamesArray = plant.common_names.split(',').map(name => name.trim());
    }
  }

  return (
    <ImageBackground
      source={require("../assets/background.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER IMAGE WITH CAROUSEL */}
        <View style={styles.imageContainer}>
          {images.length > 0 ? (
            <>
              <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleImageScroll}
                scrollEventThrottle={16}
              >
                {images.map((imageUri, index) => (
                  <Image
                    key={index}
                    source={{ uri: imageUri }}
                    style={styles.headerImage}
                  />
                ))}
              </ScrollView>

              {/* Image Pagination Dots */}
              <View style={styles.paginationContainer}>
                {images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      currentImageIndex === index && styles.paginationDotActive,
                    ]}
                  />
                ))}
                {images.length > 1 && (
                  <Text style={styles.paginationText}>
                    {currentImageIndex + 1} / {images.length}
                  </Text>
                )}
              </View>
            </>
          ) : (
            <View style={[styles.headerImage, styles.placeholderImage]}>
              <Ionicons name="leaf" size={60} color="#2F4F2F" />
            </View>
          )}

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={26} color="#ffffffff" />
          </TouchableOpacity>

          {/* View Image Button - Now using custom expand.png */}
          {images.length > 0 && (
            <TouchableOpacity
              style={styles.viewImageButton}
              onPress={handleViewImage}
            >
              <Image
                source={require("../assets/expand.png")}
                style={styles.expandIcon}
              />
            </TouchableOpacity>
          )}
        </View>

    

{/* CONTENT CARD */}
<View style={styles.contentCard}>
  {/* PLANT NAME & SCIENTIFIC NAME */}
  <Text style={styles.plantName}>{plant.plant_name}</Text>
  <Text style={styles.scientificName}>{plant.scientific_name}</Text>

  {/* COMMON NAMES - Under scientific name */}
  {commonNamesArray.length > 0 && (
    <View style={styles.alsoKnownAsContainer}>
      <Text style={styles.alsoKnownAsLabel}>Also known as</Text>
      <Text style={styles.alsoKnownAsText}>{commonNamesArray.join(', ')}</Text>
    </View>
  )}

  {/* TAGS - Display categories (Disease Types) */}
  <View style={styles.tagsRow}>
    {availableCategories.slice(0, 5).map((category, index) => {
      const colors = categoryColors[category] || { bg: "#d4e4cc", text: "#2F4F2F", border: "#b8d4a8" };
      const isSelected = selectedCategory === category;
      
      return (
        <TouchableOpacity
          key={index}
          onPress={() => setSelectedCategory(category)}
          style={[
            styles.tag, 
            { 
              backgroundColor: colors.bg,
              borderColor: colors.border,
              borderWidth: 1,
              opacity: isSelected ? 1 : 0.7
            }
          ]}
        >
          <Text style={[styles.tagText, { color: colors.text }]}>
            {category}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
</View>



        {/* HERBAL USES & BENEFITS CARD */}
        {selectedCategory && ailmentsForSelectedCategory.length > 0 && (
          <View style={styles.herbalCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="leaf-outline" size={20} color="#2F4F2F" />
              <Text style={styles.sectionTitle}>Herbal Uses & Benefits</Text>
            </View>

       {/* Category Title and Ailment Badges in Row */}
<View style={styles.ailmentHeaderRow}>
  <Text style={styles.ailmentTitle}>{selectedCategory}</Text>
  <View style={styles.categoryBadgeContainer}>
  {ailmentsForSelectedCategory.map((ailment, idx) => (
    <TouchableOpacity 
      key={idx}
     onPress={() => {
  setSelectedAilment(ailment.name);
}}
      style={[
  styles.categoryBadge,
  { 
    backgroundColor: categoryColors[selectedCategory].bg,
    borderColor: categoryColors[selectedCategory].border,
    opacity: selectedAilment === ailment.name ? 1 : 0.6,
  }
]}
    >
      <Text style={[
        styles.categoryBadgeText,
        { color: categoryColors[selectedCategory].text }
      ]}>
        {ailment.name}
      </Text>
    </TouchableOpacity>
 ))}
</View>
</View>

          

         {/* Show herbal benefit from selected ailment */}
<Text style={styles.benefitText}>
  {ailmentsForSelectedCategory.find(a => a.name === selectedAilment)?.data.herbalBenefit ||
                `${plant.plant_name} is traditionally used for ${selectedCategory.toLowerCase()} conditions. Its natural compounds may help alleviate symptoms and support overall wellness.`}
            </Text>

            {/* View Reference Link - show if any ailment in category has reference */}
           {ailmentsForSelectedCategory.find(a => a.name === selectedAilment)?.data.reference && (
             <TouchableOpacity
  style={styles.referenceButton}
onPress={() => handleReferenceLink(ailmentsForSelectedCategory.find(a => a.name === selectedAilment)?.data.reference)}
>
  <Ionicons name="link-outline" size={18} color="#2F4F2F" />
  <Text style={styles.referenceText}>View Reference Link</Text>
</TouchableOpacity>
            )}
       </View>
        )}
       


{/* BOTTOM INFO CARDS */}
<View style={styles.bottomCardsContainer}>
 



 {/* SCIENTIFIC CLASSIFICATION - Full Width */}
  {(plant.kingdom || plant.order || plant.family || plant.genus) && (
    <View style={styles.infoCard}>
      <View style={styles.infoHeader}>
        <Ionicons name="analytics-outline" size={20} color="#2F4F2F" />
        <Text style={styles.infoTitle}>Scientific Classification</Text>
      </View>
      {plant.kingdom && (
        <View style={styles.classificationRow}>
          <Text style={styles.classificationLabel}>Kingdom</Text>
          <Text style={styles.classificationValue}>{plant.kingdom}</Text>
        </View>
      )}
      {plant.order && (
        <View style={styles.classificationRow}>
          <Text style={styles.classificationLabel}>Order</Text>
          <Text style={styles.classificationValue}>{plant.order}</Text>
        </View>
      )}
      {plant.family && (
        <View style={styles.classificationRow}>
          <Text style={styles.classificationLabel}>Family</Text>
          <Text style={styles.classificationValue}>{plant.family}</Text>
        </View>
      )}
      {plant.genus && (
        <View style={styles.classificationRow}>
          <Text style={styles.classificationLabel}>Genus</Text>
          <Text style={styles.classificationValue}>{plant.genus}</Text>
        </View>
      )}
    </View>
  )}

  {/* PLANT TYPE */}
  {plant.plant_type && (
    <View style={styles.infoCard}>
      <View style={styles.infoHeader}>
        <Ionicons name="leaf-outline" size={20} color="#2F4F2F" />
        <Text style={styles.infoTitle}>Plant Type</Text>
      </View>
      <Text style={styles.infoText}>{plant.plant_type}</Text>
    </View>
  )}

  {/* DISTRIBUTION & ORIGIN - Two Column (swapped order) */}
  <View style={styles.twoColumnContainer}>
    {/* DISTRIBUTION */}
    {plant.distribution && (
      <View style={styles.halfCard}>
        <View style={styles.infoHeader}>
          <Ionicons name="map-outline" size={20} color="#2F4F2F" />
          <Text style={styles.infoTitle}>Distribution</Text>
        </View>
        <Text style={styles.infoText}>{plant.distribution}</Text>
      </View>
    )}

    {/* ORIGIN */}
    {plant.origin && (
      <View style={styles.halfCard}>
        <View style={styles.infoHeader}>
          <Ionicons name="globe-outline" size={20} color="#2F4F2F" />
          <Text style={styles.infoTitle}>Origin</Text>
        </View>
        <Text style={styles.infoText}>{plant.origin}</Text>
      </View>
    )}
  </View>

  {/* HABITAT */}
  {plant.habitat && (
    <View style={styles.infoCard}>
      <View style={styles.infoHeader}>
        <Ionicons name="location-outline" size={20} color="#2F4F2F" />
        <Text style={styles.infoTitle}>Habitat</Text>
      </View>
      <Text style={styles.infoText}>{plant.habitat}</Text>
    </View>
  )}
</View>

  


          

          
      </ScrollView>

      {/* FULL SCREEN IMAGE VIEWER MODAL */}
      <Modal
        visible={isImageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageViewer}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={closeImageViewer}
          >
            <Ionicons name="close" size={32} color="#ffffff" />
          </TouchableOpacity>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: currentImageIndex * SCREEN_WIDTH, y: 0 }}
          >
            {images.map((imageUri, index) => (
              <View key={index} style={styles.modalImageContainer}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {/* Image Counter */}
          <View style={styles.modalCounter}>
            <Text style={styles.modalCounterText}>
              {currentImageIndex + 1} / {images.length}
            </Text>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { flexGrow: 1, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" },
  errorText: { fontFamily: "Poppins", fontSize: 16, color: "#6b8f6b" },

  imageContainer: { position: "relative", width: "100%", height: 300 },
  headerImage: { width: SCREEN_WIDTH, height: 300 },
  placeholderImage: { backgroundColor: "#c5d9ba", justifyContent: "center", alignItems: "center" },

  paginationContainer: { position: "absolute", bottom: 20, left: 0, right: 0, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 },
  paginationDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.5)" },
  paginationDotActive: { backgroundColor: "#ffffff", width: 24 },
  paginationText: { fontFamily: "Poppins-Medium", fontSize: 12, color: "#ffffff", backgroundColor: "rgba(0,0,0,0.3)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 8 },

  backButton: { position: "absolute", top: 50, left: 20,  width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  viewImageButton: { position: "absolute", top: 50, right: 20,  width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  
  expandIcon: { width: 27, height: 27,  },
  expandIconSmall: { width: 18, height: 18, },



contentCard: { backgroundColor: "#f5f5f0", marginHorizontal: 0, marginTop: 0, borderRadius: 0, borderBottomLeftRadius: 25, borderBottomRightRadius: 25, padding: 20, paddingTop: 20},
plantName: { fontFamily: "Poppins-Bold", fontSize: 28, color: "#2F4F2F"},
scientificName: { fontFamily: "Poppins", fontSize: 16, color: "#6b8f6b", fontStyle: "italic", marginBottom: 12 },

 alsoKnownAsContainer: { borderRadius: 8, marginBottom: 16 },
alsoKnownAsLabel: { fontFamily: "Poppins-Medium", fontSize: 12, color: "#6b776bff", marginBottom: 2},
alsoKnownAsText: { fontFamily: "Poppins", fontSize: 14, color: "#2F4F2F", lineHeight: 18 },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  tagText: { fontFamily: "Poppins-Medium", fontSize: 11 },

  herbalCard: { backgroundColor: "#f5f5f0", marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 8 },
  sectionTitle: { fontFamily: "Poppins-SemiBold", fontSize: 16, color: "#2F4F2F" },

ailmentHeader: { marginBottom: 12 },
ailmentHeaderRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  ailmentTitle: { fontFamily: "Poppins-SemiBold", fontSize: 15, color: "#2F4F2F" },
 categoryBadgeContainer: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  categoryBadgeText: { fontFamily: "Poppins-Medium", fontSize: 10 },

  ailmentTagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  ailmentBadgeItem: { backgroundColor: "rgba(47, 79, 47, 0.1)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  ailmentBadgeText: { fontFamily: "Poppins", fontSize: 11, color: "#2F4F2F" },

 benefitText: { fontFamily: "Poppins", fontSize: 13, color: "#2F4F2F", marginTop:13, lineHeight: 20, marginBottom: 16, textAlign: "justify" },
  
  referenceButton: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  referenceText: { fontFamily: "Poppins-Medium", fontSize: 12, color: "#2F4F2F" },

  bottomCardsContainer: { marginHorizontal: 16, marginTop: 12, gap: 12 },
  infoCard: { backgroundColor: "#f5f5f0", borderRadius: 16, padding: 16 },
  infoHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  infoTitle: { fontFamily: "Poppins-SemiBold", fontSize: 14, color: "#2F4F2F" },
  infoText: { fontFamily: "Poppins", fontSize: 13, color: "#2F4F2F", lineHeight: 20 },

twoColumnContainer: { flexDirection: "row", gap: 12 },
halfCard: { flex: 1, backgroundColor: "#f5f5f0", borderRadius: 16, padding: 16 },
classificationRow: { flexDirection: "row", alignItems: "center", marginTop: 4, paddingVertical: 4 },
classificationLabel: { fontFamily: "Poppins-Medium", fontSize: 12, color: "#6b8f6b", width: 150},
classificationValue: { fontFamily: "Poppins", fontSize: 12, color: "#2F4F2F", flex: 1 },

  modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center", alignItems: "center" },
  modalCloseButton: { position: "absolute", top: 50, right: 20, zIndex: 10, width: 50, height: 50, borderRadius: 25, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  modalImageContainer: { width: SCREEN_WIDTH, height: "100%", justifyContent: "center", alignItems: "center" },
  modalImage: { width: SCREEN_WIDTH, height: "80%" },
  modalCounter: { position: "absolute", bottom: 50, alignSelf: "center", backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  modalCounterText: { fontFamily: "Poppins-Medium", fontSize: 16, color: "#ffffff" },
});