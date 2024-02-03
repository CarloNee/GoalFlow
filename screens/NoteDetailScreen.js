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

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarButton} onPress={handleSaveChanges}>
          <MaterialIcons name="save" size={24} color="#fff" />
          <Text style={styles.toolbarButtonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteNote}>
          <MaterialIcons name="delete" size={24} color="#fff" />
          <Text style={styles.toolbarButtonText}>Delete</Text>
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
    backgroundColor: '#f7f7f7',
    padding: 15,
  },
  //  Input style
  input: {
    flex: 1,
    backgroundColor: '#fff',
    fontSize: 18,
    lineHeight: 24,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    color: '#333',
  },
  // Toolbar for actions
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  // Toolbar button style
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 10,
    paddingHorizontal: 20,
  },
  // Toolbar button text style
  toolbarButtonText: {
    marginLeft: 5,
    color: '#fff',
    fontSize: 16,
  },
  // Header buttons style
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  // Delete button style
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 20,
    padding: 10,
    paddingHorizontal: 20,
    marginLeft: 15,
  },
});