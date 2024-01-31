// Import section
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// function Loading Screen
const LoadingScreen = () => {
  // Fade in the logo
  const fadeAnim = useRef(new Animated.Value(0)).current; 
  // Navigate
  const navigation = useNavigation();
  // Auth for user
  const auth = getAuth();

  useEffect(() => {
    // Start fading in the logo - using Animated from 'react-native'
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

    // Clean up the listener and timeout
    return () => {
      clearTimeout(timeout);
    };
  }, [fadeAnim, navigation, auth]);

  // return block
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Animated.View style={{ ...styles.logoContainer, opacity: fadeAnim }}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        {/* Spinning Activity Indicator */}
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
