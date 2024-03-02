// Import section
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Button, TextInput, Image, Alert, TouchableOpacity, Touchable, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { app, db, storage, auth, database } from '../firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import uuid from "uuid";
import { FontAwesome } from '@expo/vector-icons';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    // Async function to fetch user data
    const fetchData = async () => {
      // retrieve the user's profile data from AsyncStorage to minimize database calls
      const cachedProfileData = await AsyncStorage.getItem('profileData');
      // If there is cached data, parse and set it to state
      if (cachedProfileData !== null) {
        setProfileData(JSON.parse(cachedProfileData));
      } else {
        // Reference to the user's document in Firestore
        const docRef = doc(db, "users", user.uid); 
        // Snapshot of the document for the current user
        const docSnap = await getDoc(docRef); 
        if (docSnap.exists()) {
          // Set the user's data in state
          setProfileData(docSnap.data()); 
          // Store the user's data in AsyncStorage for future quick access
          await AsyncStorage.setItem('profileData', JSON.stringify(docSnap.data()));
        }
      }
    };
    // Call the fetchData function to execute on component mount
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
      Alert.alert(`Error: Unable to upload image. Please try again`);
    }
  };

  // function for handling the saving of the profile
  const handleSaveProfile = async () => {
    // specific user being referenced by uid
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, profileData, { merge: true });
    Alert.alert('Profile Updated');
  };

  // Function for handling the logout
  const handleLogout = async () => {
    try {
      // Clear AsyncStorage data
      await AsyncStorage.clear();

      // Perform Firebase sign out
      await auth.signOut();

      // Navigate to the login screen
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'Logout failed. Please try again.');
    }
  };

  // function handling the deletion of an account (screen functionality)
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

  // function to delete the user's account from firebase user 
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
      Alert.alert('Error', 'Unable to process account deletion. Please try again.');
    }
  };

  // Retrieving the app version on expoConfig.version 
  // want it to show 'App Version: 1.1.1' as an example
  const appVersion = Constants.expoConfig.version;

  // return block
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header container */}
      <View style={styles.headerContainer}>
        <View style={styles.userInfo}>
          <Text
            style={styles.name}
          >{`${profileData.firstName} ${profileData.lastName}`}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
        <TouchableOpacity
          onPress={handleImagePick}
          style={styles.imageContainer}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : profileData.photoURL ? (
            <Image
              source={{ uri: profileData.photoURL }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <FontAwesome name="user-circle-o" size={60} color="grey" />
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
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
            <MaterialIcons name="save" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Save Profile</Text>
          </TouchableOpacity>
        </View>

        {/* preferences button */}
        {/* <Button
          title="Preferences"
          onPress={() => navigation.navigate("Preferences")}
          color="#add8e6"
        /> */}
      </View>

      {/* Logout Account Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Delete Account Button */}
      <View style={styles.deleteButtonContainer}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <MaterialIcons name="delete" size={20} color="red" />
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      {/* App Version: Container to show the app version pulled from expoConfig */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>App Version: {appVersion}</Text>
      </View>
    </SafeAreaView>
  );
}

// StyleSheet
const styles = StyleSheet.create({
  // Container style
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'flex-start',
    
  },
  // Header container style
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  // User info style
  userInfo: {
    flex: 1,
  },
  // Name style
  name: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'System',
  },
  // Email style
  email: {
    fontSize: 15,
    color: '#666',
    fontFamily: 'System',
  },
  // Profile Image style
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  // Profile image style
  profileImage: {
    width: '100%',
    height: '100%',
  },
  // Profile image placeholder style
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Input areas style
  inputGroup: {
    width: '100%',
    marginVertical: 10,
  },
  // Label style
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    paddingHorizontal: 20,
    fontFamily: 'System',
  },
  // Input style
  input: {
    height: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    marginHorizontal: 20,
    borderRadius: 5,
    fontSize: 16,
    fontFamily: 'System',
  },
  // Button container style
  buttonContainer: {
    margin: 10,
    width: '100%',
  },
  // Logout container style
  logoutContainer: {
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  // delete button container
  deleteButtonContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    paddingHorizontal: 20,
  },
  // Logout button style
  logoutButton: {
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    borderRadius: 25,
  },
  saveButton: {
    backgroundColor: '#0080FF',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    borderRadius: 25,
  },
  // Delete button style
  deleteButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
  },
  // Delete button text style
  deleteButtonText: {
    marginLeft: 10,
    color: 'red',
    fontSize: 16,
    fontFamily: 'System',
  },
  // Button text style
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'System',
  },
  // text style
  textStyle: {
    color: '#333',
  },
  // Version container style
  versionContainer: {
    position: 'absolute', 
    bottom: 10, 
    width: '100%', 
    alignItems: 'center', 
  },
  // Version text style
  versionText: {
    fontSize: 14, 
    color: '#a1a1a1', 
  },
});