// Import Section
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Button, Alert, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';

// Export EditTaskScreen
export default function EditTaskScreen({ route, navigation }) {
  const { taskId } = route.params;
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [priority, setPriority] = useState('');
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState([]);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const docRef = doc(db, 'tasks', taskId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const task = docSnap.data();
          setTitle(task.title);
          setPriority(task.priority);
          setDescription(task.description);
          setSubtasks(task.subtasks || []);

          // Convert Firestore Timestamp to JavaScript Date object
          const firestoreDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate.seconds * 1000);
          setDueDate(firestoreDate);
        } else {
          Alert.alert('Error', 'Task not found.');
          navigation.goBack();
        }
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    };

    fetchTask();
  }, [taskId, navigation]);

  // function to handle updating tasks
  const handleUpdateTask = async () => {
    if (!title) {
      Alert.alert('Error', 'Please enter a title for the task.');
      return;
    }
  
    try {
      // Convert JavaScript Date to Firestore Timestamp
      const firestoreTimestamp = Timestamp.fromDate(dueDate);
  
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        title,
        dueDate: firestoreTimestamp,
        priority,
        description,
        subtasks,
      });
  
      Alert.alert('Success', 'Task updated successfully.');
  
      // Go back to TasksScreen and indicate that a task has been updated
      navigation.goBack();
      navigation.navigate('Tasks', { taskUpdated: true });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderSubtaskInputs = () => {
    return subtasks.map((subtask, index) => (
      <TextInput
        key={index}
        style={styles.input}
        placeholder={`Subtask ${index + 1}`}
        value={subtask}
        onChangeText={(text) => {
          let newSubtasks = [...subtasks];
          newSubtasks[index] = text;
          setSubtasks(newSubtasks);
        }}
      />
    ));
  };

  // Render function for EditTaskScreen
  return (
    <ScrollView style={styles.container}>
      {/* Title input field */}
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      {/* Date Picker for task due date */}
      <DateTimePicker
        style={styles.datePicker}
        value={dueDate}
        mode="date"
        display="default"
        onChange={(event, selectedDate) => {
          setDueDate(selectedDate || dueDate);
        }}
      />
      {/* Priority input field */}
      <TextInput
        style={styles.input}
        placeholder="Priority"
        value={priority}
        onChangeText={setPriority}
      />
      {/* Description input field */}
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />
      {/* Subtask input fields */}
      {renderSubtaskInputs()}
      {/* Update task button */}
      <Button title="Update Task" onPress={handleUpdateTask} />
    </ScrollView>
  );
}

// StyleSheet
const styles = StyleSheet.create({
  // Container style
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5', 
  },
  // All input styling
  input: {
    width: '100%',
    padding: 10, 
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff', 
    borderRadius: 5, 
  },
  // Date picker styling
  datePicker: {
    width: '100%',
    marginVertical: 10,
  },
  // Update task button styling 
  button: {
    backgroundColor: '#0080FF', 
    color: '#FFFFFF',
    padding: 10,
    borderRadius: 5,
  },
});
