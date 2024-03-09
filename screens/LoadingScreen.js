// Import section
import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import * as Font from 'expo-font';

// function Loading Screen
const LoadingScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const auth = getAuth();
  // Resource: https://react.dev/reference/react/useState
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Function to preload fonts
  const loadFonts = async () => {
    await Font.loadAsync({
      'FiraSans-ExtraBoldItalic': require('../assets/fonts/FiraSans-ExtraBoldItalic.ttf'),
    });
    setFontsLoaded(true);
  };

  useEffect(() => {
    // Load fonts
    loadFonts();

    // Start fading in the logo
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Check if the user is logged in with a delay
    const timeout = setTimeout(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // If logged in, navigate to home screen or dashboard
          navigation.replace('Home');
        } else {
          // If not logged in, navigate to sign up screen
          navigation.replace('Login');
        }
      });
    }, 1500);

    return () => {
      clearTimeout(timeout);
    };
  }, [fadeAnim, navigation, auth]);

  // Return a loading indicator if fonts are not loaded yet
  if (!fontsLoaded) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  // return block
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Animated.View style={{ ...styles.logoContainer, opacity: fadeAnim }}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <ActivityIndicator size="large" color="#FFFFFF" />
      </Animated.View>
    </View>
  );
};

// StyleSheet
const styles = StyleSheet.create({
  // Container Styling
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0080FF',
  },
  // Logo Container Styling
  logoContainer: {
    alignItems: 'center',
  },
  // Logo Styling
  logo: {
    width: '80%',
    height: undefined,
    aspectRatio: 1500 / 424,
    marginBottom: 20,
  },
});

export default LoadingScreen;
