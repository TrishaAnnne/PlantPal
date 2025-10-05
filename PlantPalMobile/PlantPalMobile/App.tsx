import React, { useState, useEffect } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SplashScreen from "./pages/SplashScreen";
import LoginPage from "./pages/Login";
import ScanPage from "./pages/ScanPage";
import SignUp from "./pages/SignUp";

// ✅ define all routes your stack can navigate to
export type RootStackParamList = {
  Login: undefined;
  Scan: undefined;
  SignUp: undefined;
};

const Stack = createStackNavigator<RootStackParamList>(); // ✅ typed stack

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000); // 3-second splash
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <SafeAreaView style={styles.container}>
        <SplashScreen />
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }} // hides headers globally
      >
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Scan" component={ScanPage} />
        <Stack.Screen name="SignUp" component={SignUp} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // optional: ensures splash background is white
  },
});
