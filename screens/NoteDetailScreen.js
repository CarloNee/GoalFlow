// Import section
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Alert, TouchableOpacity, Text } from 'react-native';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

// Export NoteDetailScreen
export default function NoteDetailScreen({ route, navigation }) {
  // Declaration of functional components
  // noteId - route.params, content, isEditing - useState
  const { noteId } = route.params;
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // fetch note from the database 'notes'
    const fetchNote = async () => {
      try {
        const noteRef = doc(db, 'notes', noteId);
        const noteSnap = await getDoc(noteRef);

        // if note exists
        if (noteSnap.exists()) {
          setContent(noteSnap.data().content);
          setIsEditing(true);
          // else display error 
        } else {
          Alert.alert('Error', 'Note not found.');
          navigation.goBack();
        }
        // catch error
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    };

    fetchNote();

    // Navigation - either save note or delete note icons on header top right
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleSaveChanges}>
            <MaterialIcons name="save" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteNote} style={styles.deleteButton}>
            <MaterialIcons name="delete" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [noteId, navigation]);

  // function to handle the saving of changes
  const handleSaveChanges = async () => {
    try {
      const noteRef = doc(db, 'notes', noteId);
      // update the document in the notes database
      await updateDoc(noteRef, { content });
      // show alert that note was updated
      Alert.alert('Success', 'Note updated successfully.');
      setIsEditing(false);
      // catch error if error exists
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // function to handle the deletion of a note
  const handleDeleteNote = async () => {
    try {
      const noteRef = doc(db, 'notes', noteId);
      // delete note from database 'notes'
      await deleteDoc(noteRef);
      // alert to show note deleted
      Alert.alert('Success', 'Note deleted successfully.');
      // navigate back to previous screen
      navigation.goBack();
      // catch error and display alert
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // return block for UI 
  return (
    <SafeAreaView style={styles.container}>
      {/* Input for note, multiline, editable */}
      <TextInput
        style={styles.input}
        multiline
        editable={isEditing}
        numberOfLines={4}
        value={content}
        onChangeText={setContent}
        placeholderTextColor="#c7c7c7"
      />
    </SafeAreaView>
  );
}

// StyleSheet
const styles = StyleSheet.create({
  // Container styling
  container: {
    flex: 1,
    backgroundColor: '#fffde7',
  },
  // Input styling
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    padding: 10,
    borderWidth: 0,
  },
  // Header buttons styling
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  // Delete button styling
  deleteButton: {
    marginLeft: 15,
  },
});