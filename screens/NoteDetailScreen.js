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
  // Resource: https://react.dev/reference/react/useState
  const { noteId } = route.params;
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState({ title: '', content: '' });

  useEffect(() => {
    // fetch note from the 'notes' document
    const fetchNote = async () => {
      try {
        const noteRef = doc(db, 'notes', noteId);
        const noteSnap = await getDoc(noteRef);

        // if note exists
        if (noteSnap.exists()) {
          setNote({ title: noteSnap.data().title, content: noteSnap.data().content });
          setIsEditing(true);

        // else display error - note not found
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
      headerTitle: note.title,
      // header left option - back button
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      ),
      // header right option - two buttons. Save (handleSaveChanges) and delete (handleDeleteNote)
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleSaveChanges}>
            <MaterialIcons name="save-alt" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteNote}>
            <MaterialIcons name="delete-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [noteId, navigation, note.title]);

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
        onChangeText={(text) => setNote({ ...note, content: text })}
        value={note.content}
        placeholder="Write your note..."
      />
    </SafeAreaView>
  );
}

// StyleSheet
const styles = StyleSheet.create({
  // container style
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
  },
  // back button style
  backButton: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  // back button text style
  backButtonText: {
    color: '#0080FF', 
    fontSize: 20,
  },
  // input style
  input: {
    flex: 1,
    backgroundColor: '#FFF',
    fontSize: 18,
    lineHeight: 28,
    padding: 10,
  },
  // header button (save and delete) buttons style
  headerButtons: {
    flexDirection: 'row',
    margin: 10,
    justifyContent: 'space-between',
    width: 60,
  },
});