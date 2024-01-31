// Import Section
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Animated } from 'react-native';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

// Export NotesScreen
export default function NotesScreen({ navigation }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // if user is auth'ed, display notes
  useFocusEffect(
    React.useCallback(() => {
      if (auth.currentUser) {
        fetchNotes();
      }
      return () => {}; 
    }, [])
  );

  // function for fetching notes
  const fetchNotes = async () => {
    setLoading(true);
    const userId = auth.currentUser.uid;

    // try catch block
    try {
      // get notes data from 'notes' database
      const notesQuery = query(collection(db, 'notes'), where('userId', '==', userId));
      const querySnapshot = await getDocs(notesQuery);
      const notesArr = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotes(notesArr);
      // catch error
    } catch (error) {
      // log error fetching notes if there is an error
      console.error("Error fetching notes: ", error);
    } finally {
      setLoading(false);
    }
  };

  // function for deleting note
  const deleteNote = async (noteId) => {
    try {
      // use deleteDoc function from firebase
      await deleteDoc(doc(db, 'notes', noteId));
      fetchNotes(); 
      // if error, display error
    } catch (error) {
      console.error("Error deleting note: ", error);
    }
  };

  // function for sliding a note container from right to left, showing delete button
  const renderRightActions = (progress, dragX, noteId) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    // return the touchable opacity for deleting the note button
    return (
      <TouchableOpacity 
        onPress={() => deleteNote(noteId)}
        style={styles.deleteBox}>
        <Animated.Text style={[styles.deleteText, { transform: [{ scale }] }]}>
          Delete
        </Animated.Text>
      </TouchableOpacity>
    );
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
      // swipe to reveal the delete
      <Swipeable
        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item.id)}
        overshootRight={false}
      >
        {/* Note container - touchable opacity to navigate to the singular note */}
        <TouchableOpacity 
          style={styles.noteItem} 
          onPress={() => navigation.navigate('NoteDetail', { noteId: item.id })}
        >
          {/* Display trimmed title and content */}
          <Text style={styles.noteTitle}>{trimmedTitle}</Text>
          <Text style={styles.noteContent}>{trimmedContent}</Text>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  // Function to navigate to new note using the button at the bottom
  const navigateToAddNote = () => {
    navigation.navigate('AddNote');
  };

  // return block
  return (
    <View style={styles.container}>
      {/* If loading, display loading - need to change to Activity Indicator */}
      {loading ? <Text>Loading...</Text> : (
        // displat FlatList for all the notes in their own container
        <FlatList
          data={notes}
          renderItem={renderNote}
          keyExtractor={item => item.id}
        />
      )}
      {/* Button to add a new note */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={navigateToAddNote}
      >
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
    paddingTop: 20,
    paddingHorizontal: 10,
    backgroundColor: '#0080FF', 
  },
  // Note item style
  noteItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
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
  // Add button style
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    elevation: 8,
  },
  // Add Icon style
  fabIcon: {
    fontSize: 24,
    color: "#0080FF",
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