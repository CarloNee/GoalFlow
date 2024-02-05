// Import Section
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Alert, Image, Dimensions, Animated, ActivityIndicator } from "react-native";
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, deleteDoc, addDoc, getDoc } from "firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";
import { useFonts, FiraSans_800ExtraBold_Italic } from '@expo-google-fonts/fira-sans';
import { useFocusEffect } from '@react-navigation/native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import { ScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Export NotesScreen
export default function NotesScreen({ navigation }) {
  const [notes, setNotes] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const screenWidth = Dimensions.get('window').width;

  // if user is auth'ed, display notes
  useFocusEffect(
    React.useCallback(() => {
      if (auth.currentUser) {
        fetchNotes();
      }
      return () => {}; 
    }, [])
  );

  // Function to fetch user profile data
  const fetchUserProfile = async () => {
    const docRef = doc(db, "users", auth.currentUser.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setProfileData(docSnap.data());
    }
  };

  // useLayoutEffect for header
  React.useLayoutEffect(() => {
    fetchUserProfile();
    navigation.setOptions({
      headerRight: () => (
        profileData?.photoURL ? (
          <Image
            source={{ uri: profileData.photoURL }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        ) : <MaterialIcons name="account-circle" size={40} color="#fff" />
      ),
      headerRightContainerStyle: {
        paddingRight: 10,
        paddingBottom: 10,
      },
    });
  }, [navigation, profileData]);

  // header options
  React.useLayoutEffect(() => {

    navigation.setOptions({
      headerTitle: () => (
        <Text style={styles.headerTitle}>Notes</Text>
      ),
      headerStyle: {
        backgroundColor: '#0080FF',
        borderBottomWidth: 0,
      },
      headerTitleContainerStyle: {
        left: 0,
        right: 0,
      },
      headerShadowVisible: false,
    });
  }, [navigation]);  

  // function for fetching notes, either from AsyncStorage or Firebase
  const fetchNotes = async () => {
    setLoading(true);
    const userId = auth.currentUser.uid;

    // try to retrieve the cached notes from AsyncStorage
    const cachedNotes = await AsyncStorage.getItem(`notes_${userId}`);

    // Check if there are cached notes available
    if (cachedNotes) {
      // Parse the stringified notes data and update state
      setNotes(JSON.parse(cachedNotes));
      setLoading(false);
    } else {
      // If no cached data, fetch notes from Firebase
      try {
        const notesQuery = query(collection(db, 'notes'), where('userId', '==', userId));
        const querySnapshot = await getDocs(notesQuery);
        const notesArr = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotes(notesArr);
        // Cache the fetched notes by storing them in AsyncStorage
        await AsyncStorage.setItem(`notes_${userId}`, JSON.stringify(notesArr));
      } catch (error) {
        // Handle and display errors related to fetching notes
        console.error("Error fetching notes: ", error);
        Alert.alert("Error", "An error occurred while fetching notes.");
      } finally {
        setLoading(false);
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const refreshNotes = navigation.addListener('focus', () => {
        const routeParams = navigation.getState().routes.find(route => route.name === 'Notes')?.params;
        if (routeParams?.newNoteAdded) {
          fetchNotes();
          // Reset the parameter so it doesn't refetch every time
          navigation.setParams({ newNoteAdded: false });
        }
      });
      return refreshNotes;
    }, [navigation])
  );

  // function for deleting note
  const deleteNote = async (noteId) => {
    try {
      // Delete the note from Firebase
      await deleteDoc(doc(db, 'notes', noteId));

      // Filter out the deleted note from the current notes array
      const updatedNotes = notes.filter(note => note.id !== noteId);

      // Update AsyncStorage with the new notes array
      await updateCache(updatedNotes);

      // Update local state with the new notes array
      setNotes(updatedNotes);
    } catch (error) {
      console.error("Error deleting note: ", error);
      Alert.alert("Error", "An error occurred while deleting the note.");
    }
  };

  // Function for confirming and deleting note
  const confirmAndDeleteNote = (noteId) => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => deleteNote(noteId) },
      ]
    );
  };

  // Function to update the cache after adding/editing a note
  const updateCache = async (updatedNotes) => {
    const userId = auth.currentUser.uid;
    await AsyncStorage.setItem(`notes_${userId}`, JSON.stringify(updatedNotes));
  };

 // Function to remove a note from the cache
  const removeFromCache = async (noteId) => {
    const userId = auth.currentUser.uid;
    const cachedNotes = await AsyncStorage.getItem(`notes_${userId}`);
    if (cachedNotes) {
      let notesArr = JSON.parse(cachedNotes);
      notesArr = notesArr.filter(note => note.id !== noteId);
      await AsyncStorage.setItem(`notes_${userId}`, JSON.stringify(notesArr));
    }
  }; 


  // function to render the note
  const renderNote = ({ item }) => {

    // Title and Content trimmed so containers are the same size, uniformity
    // Title trimmed to first 25 character
    const trimmedTitle = item.title.length > 25 ? item.title.slice(0, 25) + '...' : item.title;
    // Content trimmed to first 50 characters
    const trimmedContent = item.content.length > 150 ? item.content.slice(0, 50) + '...' : item.content;
    
    // return block
    return (
      <ScrollView style={styles.scrollContainer}>
      <View style={styles.noteItem}>
        <TouchableOpacity onPress={() => navigation.navigate('NoteDetail', { noteId: item.id })} style={styles.noteContentContainer}>
          <Text style={styles.noteTitle}>{trimmedTitle}</Text>
          <Text style={styles.noteContent}>{trimmedContent}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmAndDeleteNote(item.id)} style={styles.deleteIcon}>
          <MaterialIcons name="delete" size={24} color="red" />
        </TouchableOpacity>
      </View>
      </ScrollView>
    );
  };

  // Function to navigate to new note using the button at the bottom
  const navigateToAddNote = () => {
    navigation.navigate('AddNote');
  };

  // return block
  return (
    <View style={styles.container}>
      {/* If loading, display loading */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : notes.length === 0 ? (
        // Display "No Notes" when there are no notes
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notes...</Text>
        </View>
      ) : (
        // displat FlatList for all the notes in their own container
        <FlatList
          data={notes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
        />
      )}
      {/* Button to add a new note */}
      <TouchableOpacity style={styles.fab} onPress={navigateToAddNote}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// StyleSheet
const styles = StyleSheet.create({
  // Container Style
  container: {
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 15,
    backgroundColor: '#0080FF', 
  },
  // Header title style
  headerTitle: {
    textAlign: 'center',
    fontFamily: 'FiraSans-ExtraBoldItalic',
    fontSize: 25,
    color: '#fff',
  },
  // Profile image style
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  // Header right container style
  headerRightContainer: {
    paddingRight: 10,
  },
  // Header title container style
  headerTitleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Loading container style
  centeredContainer: {
    color: "#FFFFFF"
  },
  // Loading container style
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Scroll container style
  scrollContainer: {
    padding: 10,
  },
  // Note item style
  noteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  // Note content container style
  noteContentContainer: {
    flex: 1,
  },
  // Delete icon style
  deleteIcon: {
    marginLeft: 10,
  },
  // Empty container style
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Empty container text style
  emptyText: {
    fontSize: 20,
    color: 'white',
  },
  // Note title style
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  // Note content style
  noteContent: {
    fontSize: 16,
    color: '#333',
  },
  // Action button style
  fab: {
    position: "absolute",
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    elevation: 8,
  },
  // Action button icon style
  fabIcon: {
    fontSize: 50,
    color: "#0080FF",
    lineHeight: 56,
  },
  // Delete box style
  deleteBox: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'flex-end',
    flex: 1,
    paddingRight: 20,
  },
  // Delete text style
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});