import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet, Platform, SafeAreaView, Text } from "react-native";
import ScanPage from "./ScanPage";
import SearchPage from "./SearchPage";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function MainTab() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#2D5016", // Dark green for active
        tabBarInactiveTintColor: "#aec2a8ff", // Light sage for inactive
      }}
    >
      <Tab.Screen
        name="SearchTab"
        component={SearchPage}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name="search" 
              size={28} 
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="ScanTab"
        component={ScanPage}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.cameraButtonContainer}>
              <View style={[
                styles.cameraButton,
                focused && styles.cameraButtonFocused
              ]}>
                <Ionicons 
                  name="camera" 
                  size={28} 
                  color="#fff"
                />
              </View>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="JournalTab"
        component={JournalPlaceholder}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name="book" 
              size={27} 
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Placeholder for Journal until you create the full component
function JournalPlaceholder() {
  return (
    <SafeAreaView 
      style={{ 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center", 
        backgroundColor: "#f5f5f5",
        paddingBottom: 80, // Account for tab bar
      }}
    >
      <Ionicons name="journal-outline" size={60} color="#4A7C59" />
      <Text 
        style={{ 
          fontSize: 24, 
          fontFamily: "Poppins-Bold",
          color: "#4A7C59", 
          marginTop: 20 
        }}
      >
        Journal
      </Text>
      <Text 
        style={{ 
          fontSize: 16, 
          fontFamily: "Poppins",
          color: "#666", 
          marginTop: 10 
        }}
      >
        Coming Soon!
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 95 : 82,
    backgroundColor: "#d9e3ccff",
    borderTopWidth: 1,
    borderTopColor: "#e1e9d7",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    paddingHorizontal: 25,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 25 : 12,
  },
  cameraButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    width: 54,
    height: 48,
    borderRadius: 28,
    backgroundColor: "#2D5016",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  cameraButtonFocused: {
    backgroundColor: "#3A6B1E",
    transform: [{ scale: 1.05 }],
  },
});