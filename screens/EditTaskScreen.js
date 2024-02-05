// Import Section
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Button, Alert, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';

// Export EditTaskScreen
export default function EditTaskScreen({ route, navigation }) {
  // Declaration of components
  // taskId - route.params, title, due date, priority, description, subtasks
  const { taskId } = route.params;
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [priority, setPriority] = useState('');
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState([]);

  // UseEffect to fetch tasks from the 'tasks' database
  useEffect(() => {
    const fetchTask = async () => {
      // try catch block
      try {
        const docRef = doc(db, 'tasks', taskId);
        const docSnap = await getDoc(docRef);
  
        // if docSnap.exists - set various components based on what user enters
        // title, priority, description, subtasks
        if (docSnap.exists()) {
          const task = docSnap.data();
          setTitle(task.title);
          setPriority(task.priority);
          setDescription(task.description);
          setSubtasks(task.subtasks || []);
  
          // new due date if user changes the due date
          let firestoreDate = new Date();
          if (task.dueDate) {
            firestoreDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
          }
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

  const handleUpdateTask = async () => {
    if (!title) {
      Alert.alert('Error', 'Please enter a title for the task.');
      return;
    }
  
    try {
      // Convert JavaScript Date object to Firestore Timestamp
      const firestoreTimestamp = Timestamp.fromDate(dueDate);
  
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        title,
        dueDate: firestoreTimestamp, // Update with Firestore Timestamp
        priority,
        description,
        subtasks,
      });
  
      Alert.alert('Success', 'Task updated successfully.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // function to render the input for subtasks
  // feature not working - needs work done
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

  // return block for UI
  return (
    <ScrollView style={styles.container}>
      {/* Title Field */}
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      {/* Date Picker */}
      <DateTimePicker
        style={styles.datePicker}
        value={dueDate}
        mode="date"
        display="default"
        onChange={(event, selectedDate) => {
          setDueDate(selectedDate || dueDate);
        }}
      />
      {/* Priority Field */}
      <TextInput
        style={styles.input}
        placeholder="Priority"
        value={priority}
        onChangeText={setPriority}
      />
      {/* Description Field */}
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />
      {renderSubtaskInputs()}
      {/* Button to update task - use function handleUpdateTask */}
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
