// Import Section
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, Alert, ScrollView, SafeAreaView, Dimensions, Image, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { MaterialIcons } from "@expo/vector-icons";

// Export EditTaskScreen
export default function EditTaskScreen({ route, navigation }) {
  const { taskId } = route.params;
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [priority, setPriority] = useState('');
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const screenWidth = Dimensions.get('window').width;

  // Function to fetch user profile data
  const fetchUserProfile = async () => {
    const docRef = doc(db, "users", auth.currentUser.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setProfileData(docSnap.data());
    }
  };

  // useLayoutEffect for header and profile image
  React.useLayoutEffect(() => {
    fetchUserProfile();
    navigation.setOptions({
      headerRight: () => (
        profileData?.photoURL ? (
          <Image
            source={{ uri: profileData.photoURL }}
            style={styles.profileImage}
          />
        ) : <MaterialIcons name="account-circle" size={40} color="#fff" />
      ),
      headerRightContainerStyle: styles.headerRightContainer,
      headerTitle: () => (
        <Text style={styles.headerTitle}>Edit Task</Text>
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
  }, [navigation, profileData]);

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
      // update the data in the collection
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

  // Function to render the subtasks input
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>

        {/* Title input field */}
        <Text style={styles.labelText}>Title:</Text>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />

        {/* Date Picker for task due date */}
        <Text style={styles.labelText}>Due Date:</Text>
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
        <Text style={styles.labelText}>Priority:</Text>
        <TextInput
          style={styles.input}
          placeholder="Priority"
          value={priority}
          onChangeText={setPriority}
        />

        {/* Description input field */}
        <Text style={styles.labelText}>Description:</Text>
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
        <TouchableOpacity style={styles.buttonContainer} onPress={handleUpdateTask}>
          <Text style={styles.buttonText}>Update Task</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// StyleSheet
const styles = StyleSheet.create({
  // Container Style
  container: {
    flex: 1,
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
  // ScrollView Style
  scrollView: {
    paddingHorizontal: 20,
  },
  // Label text style
  labelText: {
    fontSize: 15,
    color: "#FFFFFF",
    textAlign: "center",
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
    textAlign: "center"
  },
  // Update task button styling 
  buttonContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginVertical: 10
  },
  // Button text style
  buttonText: {
    color: '#0080FF',
    fontSize: 18
  },
});
