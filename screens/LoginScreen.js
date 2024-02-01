// Import Section
import React, { useEffect, useState } from "react";
import { View, StyleSheet, TextInput, Button, ActivityIndicator, Alert, Image, Text, TouchableOpacity,KeyboardAvoidingView } from 'react-native';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth'; 

// Export Login Screen
export default function LoginScreen({ navigation }) {
  // Declare functional components
  // email, password, loading, error - all useState
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to handle user login
  const handleLogin = () => {

    setError(null);
    setLoading(true);

    // signInWithEmailAndPassword from react native firebase 
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
      })
      .catch((error) => {
        Alert.alert("Error", "Incorrect username/password", [{ text: "OK" }]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // password reset navigation
  const navigateToPasswordReset = () => {
    navigation.navigate('PasswordReset');
  };

  // check whether the user has an account, if they do, navigate to the home screen
  useEffect(() => {
    // try catch block
    try {
    const viewableUser = auth.onAuthStateChanged((valUser) =>{
      if(valUser){
        navigation.navigate("Home");
      }
    })
    return viewableUser;
  } catch (error) {
    console.log(error);
  }
  }, [navigation]);

  // function to navigate to Register Screen if user clicks on the link to Register
  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  // return block for UI
  return (
    <View style={styles.container}>
      {/* GoalFlow Logo */}
      <Image 
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      {/* input fields for email and password */}
      <TextInput
        style={styles.input}
        placeholderTextColor="#FFFFFF"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor="#FFFFFF"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {/* Login Button */}
      {loading ? (
        <ActivityIndicator size="large" color="#FFFFFF" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
      )}

      {/* Register Navigation Text - Touchable Opacity - navigate to register */}
      <TouchableOpacity onPress={navigateToRegister}>
        <Text style={styles.registerText}>
        Don't have an account? <Text style={styles.registerLink}>Register</Text>
        </Text>
      </TouchableOpacity>
      {/* Forgot Password Text - Touchable Opacity - email sent to user's email for password reset */}
      <TouchableOpacity onPress={navigateToPasswordReset} style={styles.passwordReset}>
        <Text style={styles.passwordResetText}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
}

// StyleSheet
const styles = StyleSheet.create({
  // Container style
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0080FF',
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
    fontWeight: 'bold',
    color: '#1E90FF',
    marginBottom: 20,
  },
  // All input style
  input: {
    width: '80%',
    padding: 10,
    fontSize: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF', 
    borderRadius: 20,
    color: '#FFFFFF',
    textAlign: "center",
    
  },
  // Button style
  button: {
    width: '80%',
    backgroundColor: 'transparent', 
    padding: 10,
    marginVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF', 
    borderRadius: 20,
  },
  // Button text style
  buttonText: {
    color: '#FFFFFF', 
    fontWeight: 'bold',
  },
  // Register text style
  registerText: {
    marginTop: 15,
    color: '#FFFFFF', 
  },
  // Register link for text style
  registerLink: {
    fontWeight: 'bold',
  },
  // Password reset touchable style
  passwordReset: {
    margin: 10,
  },
  // Password reset text style
  passwordResetText: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
});
