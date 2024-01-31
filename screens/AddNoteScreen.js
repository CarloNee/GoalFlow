// Import Section
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Alert, TouchableOpacity, Text } from 'react-native';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';

// Export AddNoteScreen
export default function AddNoteScreen({ navigation }) {
  // Declare Title, Content for Note (useState)
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // useEffect function for handling save button on top right of the header section
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleSaveNote} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Save</Text>
        </TouchableOpacity>
      ),
    });
  }, [title, content, navigation]);

  // handleSaveNote function
  const handleSaveNote = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please enter a title and some content for the note.');
      return;
    }

    //  try catch block
    try {
      // add the details of the note to the database - add title, content, timestamp, userId
      await addDoc(collection(db, 'notes'), {
        title,
        content,
        timestamp: new Date(),
        userId: auth.currentUser.uid,
      });

      // Alert if successful
      Alert.alert('Success', 'Note added successfully.');
      // Go back to the previous screen upon completion
      navigation.goBack();
      // Alert message for error as to why note was not added to database
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // return block for the UI
  return (
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
  );
}

// StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Title input style
  titleInput: {
    fontSize: 25,
    fontWeight: 'bold',
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
  // Header button style
  headerButton: {
    marginRight: 10,
  },
  // Header button text style
  headerButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
});
