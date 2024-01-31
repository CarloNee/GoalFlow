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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [loading, setLoading] = useState(false);

  // function to handle sign up to the application
  const handleSignUp = () => {
    // data entry checks for length
    if (email.length === 0 || password.length === 0 || firstName.length === 0 || surname.length === 0) {
      Alert.alert('Error', 'Please enter all the details');
      return;
    }

    setLoading(true);

    const auth = getAuth();

    // createUserWithEmailAndPassword from firebase
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

      {/* touchable opacity text for members - navigate to LoginScreen */}
      <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ margin: 20, alignItems: "center"}}>
        <Text style={styles.buttonText}>Already a member? Log in here</Text>
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
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 20,
    color: '#FFFFFF',
    textAlign: 'center',
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
});
