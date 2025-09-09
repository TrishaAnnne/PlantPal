import React from "react";
import { StyleSheet, View, ImageBackground, Image } from "react-native";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/background.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <Image
          source={require("../assets/plantpal-homescreen-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 250, // adjust as needed
    height: 250,
  },
});
