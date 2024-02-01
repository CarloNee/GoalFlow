// Import section
import React, { useState } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert, Image } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

// Export PasswordResetScreen
export default function PasswordResetScreen() {
  // declaration of functional components
  // email, loading - useState
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // function for handling password reset
  const handlePasswordReset = () => {
    setLoading(true);
    // firebase sendPasswordResetEmail function to email the user the password reset link
    sendPasswordResetEmail(auth, email)
      .then(() => {
        // Display alert to user to check their email address used to sign up 
        Alert.alert(
          "Check your email",
          "Password reset email sent successfully"
        );
        setLoading(false);
      })
      // if error, display error 
      .catch((error) => {
        Alert.alert("Error", error.message);
        setLoading(false);
      });
  };

  // function to handle navigation to LoginScreen
  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  // return block
  return (
    <View style={styles.container}>
      {/* GoalFlow Logo */}
      <Image
        source={require("../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      {/* Reset Password text */}
      <Text style={styles.title}>Reset Password</Text>
      {/* Text input for email address */}
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor= "#FFFFFF"
        value={email}
        onChangeText={setEmail}
      />
      {/* if loading, show loading indicator, otherwise send reset email */}
      {loading ? (
        <ActivityIndicator size="large" color="#FFFFFF" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
          <Text style={styles.buttonText}>Send Reset Email</Text>
        </TouchableOpacity>
      )}

        <TouchableOpacity onPress={navigateToLogin}>
          <Text style={styles.linkText}>Back to Login</Text>
        </TouchableOpacity>
    </View>
  );
}

// StyleSheet
const styles = StyleSheet.create({
  // Container style
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0080FF",
  },
  // Logo style
  logo: {
    width: '80%',
    height: undefined,
    aspectRatio: 1500 / 424,
    marginBottom: 20,
  },
  // Title style
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  // Input style
  input: {
    width: "80%",
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 20,
    color: "#FFFFFF",
    textAlign: "center",
    
  },
  // Button style
  button: {
    width: "80%",
    backgroundColor: "transparent",
    padding: 10,
    marginVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 20,
  },
  // Button text style
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  // back to login link text style
  linkText: {
    marginTop: 15,
    color: "#FFFFFF",
    textDecorationLine: 'underline',
  },
});
