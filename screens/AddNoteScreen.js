// Import Section
import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, Alert, TouchableOpacity, Text, Image } from "react-native";
import { db, auth } from "../firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import * as Font from "expo-font";

// Export AddNoteScreen
export default function AddNoteScreen({ navigation }) {
  // Declare Title, Content for Note (useState)
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [profileData, setProfileData] = useState(null);

  // Function to fetch user profile data
  const fetchUserProfile = async () => {
    const docRef = doc(db, "users", auth.currentUser.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setProfileData(docSnap.data());
    }
  };

  // useEffect function for handling save button and header
  useEffect(() => {
    fetchUserProfile();
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleSaveNote} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Save</Text>
        </TouchableOpacity>
      ),
      headerTitle: () => <Text style={styles.headerTitle}>New Note</Text>,
      headerStyle: {
        backgroundColor: "#0080FF",
      },
      headerTitleStyle: {
        color: "white",
      },
      headerTintColor: "white",
    });
  }, [title, content, navigation, profileData]);

  // handleSaveNote function
  const handleSaveNote = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert(
        "Error",
        "Please enter a title and some content for the note."
      );
      return;
    }

    // Function to update AsyncStorage with the new note
    const updateAsyncStorage = async (newNote) => {
      const userId = auth.currentUser.uid;
      const storedNotes = await AsyncStorage.getItem(`notes_${userId}`);
      let notesArray = storedNotes ? JSON.parse(storedNotes) : [];
      notesArray.push(newNote);
      await AsyncStorage.setItem(`notes_${userId}`, JSON.stringify(notesArray));
    };

    // try catch block
    try {
      const newNote = {
        title,
        content,
        timestamp: new Date(),
        userId: auth.currentUser.uid,
      };

      const docRef = await addDoc(collection(db, "notes"), newNote);
      // Set the newly created note ID
      newNote.id = docRef.id;
      // Update AsyncStorage
      await updateAsyncStorage(newNote);

      Alert.alert("Success", "Note added successfully.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // return block for the UI
  return (
    <View style={styles.container}>
      {/* Note title area */}
      <TextInput
        style={styles.titleInput}
        placeholder="Note Title"
        placeholderTextColor="#c7c7c7"
        value={title}
        onChangeText={setTitle}
      />
      {/* Note content area */}
      <TextInput
        style={styles.contentInput}
        multiline
        numberOfLines={4}
        placeholder="Write your note here..."
        placeholderTextColor="#c7c7c7"
        value={content}
        onChangeText={setContent}
      />
    </View>
  );
}

// StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 10,
  },
  // Header title style
  headerTitle: {
    textAlign: "center",
    fontFamily: "FiraSans-ExtraBoldItalic",
    fontSize: 25,
    color: "#fff",
  },
  // Profile image style
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  // Header right container style
  headerRightContainer: {
    paddingRight: 10,
  },
  // Header title container style
  headerTitleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Header button style
  headerButton: {
    marginLeft: 10,
  },
  // Header button text style
  headerButtonText: {
    fontSize: 18,
    color: "#FFFFFF",
    padding: 10,
  },
  // Title input style
  titleInput: {
    fontSize: 25,
    fontWeight: "bold",
    padding: 10,
    borderBottomWidth: 0,
  },
  // Content input style
  contentInput: {
    flex: 1,
    fontSize: 20,
    lineHeight: 22,
    padding: 10,
    borderBottomWidth: 0,
  },
});
