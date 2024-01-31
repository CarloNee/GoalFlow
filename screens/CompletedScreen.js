// Import Section
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Alert } from 'react-native';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

// Export Completed Screen
export default function CompletedScreen({ navigation }) {
  // Declaration of functional components needed for Completed Screen
  // completed tasks and loading
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // useFocusEffect - check if current user is auth'ed, if so - fetch completed tasks 
  // see fetchCompletedTasks function
  useFocusEffect(
    React.useCallback(() => {
      if (auth.currentUser) {
        fetchCompletedTasks();
      }
      return () => {}; 
    }, [])
  );

  // function for fetch completed tasks from user in database
  const fetchCompletedTasks = async () => {
    // set the loading state as true
    setLoading(true);
    // userId = the uid of the current auth'ed user
    const userId = auth.currentUser.uid;

    // try catch block
    try {
      // declare completedTasksQuery, querySnapshot and tasksArr
      const completedTasksQuery = query(collection(db, 'completed'), where('userId', '==', userId));
      const querySnapshot = await getDocs(completedTasksQuery);
      const tasksArr = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompletedTasks(tasksArr);
    } catch (error) {
      // console the error if unable to fetch the completed tasks from database
      console.error("Error fetching completed tasks: ", error);
      // show the user the error as an alert so they are infromed completed tasks cannot be fetched
      Alert.alert('Error', 'Unable to fetch completed tasks.');
    } finally {
      // change setLoading state to false
      setLoading(false);
    }
  };

  // function to render the completed task
  const renderCompletedTask = ({ item }) => (
    // task container
    <View style={styles.taskItem}>
      {/* on pressing the task, navigate to the Edit Task Screen */}
      <TouchableOpacity onPress={() => navigation.navigate("EditTask", { taskId: item.id })}>
        {/* Title of the completed Task */}
        <Text style={styles.taskTitle}>{item.title}</Text>
  
        {/* Task detail section */}
        <View style={styles.taskDetails}>
          {/* Text for the date */}
          <Text style={styles.dateTitle}>
            Due: {item.dueDate.toDate ? item.dueDate.toDate().toLocaleDateString() : new Date(item.dueDate.seconds * 1000).toLocaleDateString()}
          </Text>
          {/* Text for the priority */}
          <Text style={styles.priorityTitle}>Priority: {item.priority}</Text>
        </View>
        {/* Task description container */}
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  // return block for the UI
  return (
    <View style={styles.container}>
      {/* If loding, show the loading tasks text - change to loading indicator */}
      {loading ? (
        <Text>Loading Completed Tasks...</Text>
      ) : (
        // else show the tasks in the way the function renderCompletedTask has conveyed it
        <FlatList
          data={completedTasks}
          renderItem={renderCompletedTask}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
}

// StyleSheet
const styles = StyleSheet.create({
  // Container StyleSheet
  container: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: '#0080FF',
  },
  // Task item style
  taskItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 5,
  },
  // Task title style
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  // Task detail style
  taskDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  // Date title style
  dateTitle: {
    fontSize: 16,
    color: "#333",
  },
  // Priority title style
  priorityTitle: {
    fontSize: 16,
    color: "#333",
  },
  // description container style
  descriptionBox: {
    backgroundColor: "#e0e0e0",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  // description text in the description container style
  descriptionText: {
    fontSize: 16,
    color: "#333",
  },
});
