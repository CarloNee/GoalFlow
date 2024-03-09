// Import section
import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, Image, ActivityIndicator, Alert } from 'react-native';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Export RegisterScreen
export default function RegisterScreen({ navigation }) {
  // Declaration of functional components
  // email, password, first name, surname, loading - useState
  // Resource: https://react.dev/reference/react/useState
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [loading, setLoading] = useState(false);

  // function to handle sign up to the application
  // code adapted from my development of the HolidayHub app for the Mobile Development module final deliverable
  // Developed September 2023
  const handleSignUp = () => {
    // data entry checks for length
    if (email.length === 0 || password.length === 0 || firstName.length === 0 || surname.length === 0) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);

    const auth = getAuth();

    // createUserWithEmailAndPassword from firebase
    // Resource: https://firebase.google.com/docs/auth/web/password-auth#create_a_password-based_account
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // send email 
        sendEmailVerification(user)
          .then(() => {
          })
          // catch any error if error yielded
          .catch((error) => {
            Alert.alert('Error', 'Failed to send verification email');
          });

        // update 'users' database with first name, last name, email and profileImage set to null
        // Resource: https://firebase.google.com/docs/firestore/manage-data/add-data#set_a_document
        setDoc(doc(db, "users", user.uid), {
          firstName: firstName,
          lastName: surname,
          email: email,
          profileImage: null,
        });

        setLoading(false);
        // Once registered, navigate to the login screen
        navigation.navigate('Login');
      })
      // catch any error and display error message 
      .catch((error) => {
        setLoading(false);
        Alert.alert('Error', error.message);
      });
  };

  // return block
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />

      {/* Text Inputs for Name, Email, Password */}
      <TextInput style={styles.input} placeholder="First Name" placeholderTextColor="#FFFFFF" value={firstName} onChangeText={setFirstName} textAlign="center" />
      <TextInput style={styles.input} placeholder="Surname" placeholderTextColor="#FFFFFF" value={surname} onChangeText={setSurname} textAlign="center" />
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#FFFFFF" value={email} onChangeText={setEmail} textAlign="center" />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#FFFFFF" secureTextEntry value={password} onChangeText={setPassword} textAlign="center" />

      {/* If loading, activity indicator otherwise sign up touchable opacity */}
      {loading ? (
        <ActivityIndicator size="large" color="#FFFFFF" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      )}

      {/* Navigation to Login Screen */}
      <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ margin: 20, alignItems: "center"}}>
        <Text style={styles.registerText}>Already a member? <Text style={styles.loginInLink}>Log in here</Text></Text>
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
  // Input style
  input: {
    width: '80%',
    padding: 5,
    fontSize: 15,
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
    color: '#FFFFFF',
  },
  // Button style
  button: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    padding: 10,
    marginVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  // Button text style
  buttonText: {
    color: '#0080FF',
    fontWeight: 'bold',
  },
  // Register text style
  registerText: {
    color: '#FFFFFF', 
  },
  // Login text style
  loginInLink: {
    color: '#FFFFFF', 
    fontWeight: 'bold',
  },
});
