// Import section
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Button, TextInput, Image, Alert, TouchableOpacity, Touchable, ActivityIndicator, SafeAreaView } from 'react-native';
import { app, db, storage, auth, database } from '../firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import uuid from "uuid";
import { FontAwesome } from '@expo/vector-icons';

// Export ProfileScreen
export default function ProfileScreen({ navigation }) {
  // Declaration of functional components
  // user, profile data, image, is loading
  const user = auth.currentUser;
  const [profileData, setProfileData] = useState({ firstName: '', lastName: '', photoURL: '' });
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // fetch data, need to fetch the users details from the 'users' database
  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfileData(docSnap.data());
      }
    };
    fetchData();
  }, []);

  // function for handling the profile picture selection
  const handleImagePick = async () => {
    setIsLoading(true);
    // using the ImagePicker module from React Native
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    // if a user successfully uploads a profile picture, set the image, profile data and isloading to false
    if (!result.canceled) {
      const uploadURL = await uploadImageAsync(result.assets[0].uri);
      setProfileData({ ...profileData, photoURL: uploadURL });
      setImage(uploadURL);
      setIsLoading(false);
      // else don't set anything
    } else {
      setImage(null);
      setIsLoading(false);
    }
  };

  // function for uploading Image (async)
  // code from firebase.js
  const uploadImageAsync = async (uri) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
  
    try {
      const storageRef = ref(storage, `profilePictures/image-${Date.now()}`);
  
      const result = await uploadBytes(storageRef, blob);
  
      blob.close();
  
      return await getDownloadURL(storageRef);
  
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // function for handling the saving of the profile
  const handleSaveProfile = async () => {
    // specific user being referenced by uid
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, profileData, { merge: true });
    Alert.alert('Profile Updated');
  };

  // function for handling the logout
  const handleLogout = () => {
    auth.signOut().then(() => {
      // once logged out, change navigation to login
      navigation.replace('Login');
    }).catch(error => {
      Alert.alert('Error', error.message);
    });
  };

  // function handling the deletion of an account
  const handleDeleteAccount = () => {
    // show alert to the user with cancel and delete options
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        // options, either cancel or delete buttons on the alert
        { text: "Cancel", style: "cancel" },
        // delete option - using deleteUserAccount function
        { text: "Delete", onPress: () => deleteUserAccount() },
      ]
    );
  };

  // function to delete the user's account
  const deleteUserAccount = async () => {
    try {
      // Delete user data from Firestore
      await deleteDoc(doc(db, "users", user.uid));

      // Delete user from Authentication
      await user.delete();

      // navigate to login screen once deletion is a success
      navigation.replace('Login');
      // if an error yielded, catch error and display error message
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // return block
  return (
    <SafeAreaView style={styles.container}>
      {/* Header container */}
      <View style={styles.headerContainer}>
        <View style={styles.userInfo}>
          <Text style={styles.name}>{profileData.firstName} {profileData.lastName}</Text>
          <Text style={styles.email}>{user.email}</Text>
          {/* Display the task counts here */}
        </View>

        {/* Image Display and Picker */}
        <TouchableOpacity onPress={handleImagePick} style={styles.imageContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : profileData.photoURL ? (
            <Image source={{ uri: profileData.photoURL }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <MaterialIcons name="file-upload" size={40} color="grey" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Profile Fields */}
      <View style={styles.inputGroup}>
        {/* First Name input area */}
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          value={profileData.firstName}
          onChangeText={(text) =>
            setProfileData({ ...profileData, firstName: text })
          }
          placeholder="First Name"
        />
      </View>
      <View style={styles.inputGroup}>
        {/* Last name input area */}
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={profileData.lastName}
          onChangeText={(text) =>
            setProfileData({ ...profileData, lastName: text })
          }
          placeholder="Last Name"
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        {/* Save profile button */}
        <Button
          title="Save Profile"
          onPress={handleSaveProfile}
          color="#add8e6"
        />
        {/* preferences button */}
        <Button
          title="Preferences"
          onPress={() => navigation.navigate("Preferences")}
          color="#add8e6"
        />
      </View>

      {/* Logout and Delete Account */}
      <View style={styles.logoutDeleteContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logoutDeleteContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
        >
          <MaterialIcons name="delete" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// StyleSheet
const styles = StyleSheet.create({
  // Container style
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0080FF', 
  },
  // Header container style
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    alignItems: 'center',
    width: '100%',
    paddingVertical: 20,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',

  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#FFFFFF'
  },
  email: {
    fontSize: 18,
    color: '#FFFFFF'
  },
  // Image container style
  imageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  // Profile picture style
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#dddddd',
  },
  // Image placeholder style
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#dddddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // text style for changing photo
  changePhotoText: {
    color: '#FFF',
    marginTop: 8,
  },
  // input style for the input sections
  inputGroup: {
    width: '100%',
    marginBottom: 15,
  },
  // Label style
  label: {
    color: '#333',
    marginBottom: 5,
    marginLeft: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // Input style
  input: {
    width: '90%',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#94c6f7',
    color: '#FFFFFF',
  },
  // Button container style
  buttonContainer: {
    marginTop: 20,
    width: '90%',
    alignSelf: 'center',
  },
  // Logout delete container style
  logoutDeleteContainer: {
    flexDirection: 'column',
    padding: 10,
    // justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 10,

  },
  // Logout button style
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#D32F2F',
    padding: 10,
    borderRadius: 20,
  },
  // delete account style
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 20,
  },
  // button text style
  buttonText: {
    color: '#FFF',
    marginLeft: 5,
  },
  // text style
  textStyle: {
    color: '#333',
  }
});