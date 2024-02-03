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
      {/* Note Content Input */}
      <TextInput
        style={styles.input}
        multiline
        editable={isEditing}
        onChangeText={setContent}
        value={content}
        placeholder="Write your note..."
        placeholderTextColor="#C7C7C7"
      />

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton} onPress={handleSaveChanges}>
          <Text style={styles.actionButtonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleDeleteNote}>
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
  },
  input: {
    flex: 1,
    marginTop: 30,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    fontSize: 18,
    lineHeight: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
    color: '#333',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 15,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  deleteButton: {
    color: '#FF3B30',
  },
});