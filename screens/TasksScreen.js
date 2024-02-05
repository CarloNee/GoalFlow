// Import section
import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Alert, Image, Dimensions, ActivityIndicator } from "react-native";
import { db, auth } from "../firebase";
import { collection, query as firestoreQuery, where, getDocs, doc, deleteDoc, addDoc, getDoc } from "firebase/firestore";
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from "@expo/vector-icons";
// import { useFonts, FiraSans_800ExtraBold_Italic } from '@expo-google-fonts/fira-sans';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Export TasksScreen
export default function TasksScreen({ navigation, route }) {

  // declaration of functional components
  // tasks, loading, profile data
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Function to determine part of the day
  // tasksscreen should should good morning, good afternoon, good evening
  // depending on time of day
  const getPartOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  // useLayoutEffect for header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        profileData?.photoURL ? (
          <Image
            source={{ uri: profileData.photoURL }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        ) : <MaterialIcons name="account-circle" size={40} color="#fff" />
      ),
      headerRightContainerStyle: {
        paddingRight: 10,
      },
    });
  }, [navigation, profileData]);

  // useFocusEffect to refresh tasks and user profile every time the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = navigation.addListener('focus', () => {
        // Fetch user profile data every time the screen is focused
        fetchUserProfile();

        // Check if a new task has been added and fetch tasks
        const routeParams = navigation.getState().routes.find(route => route.name === 'TasksScreen')?.params;
        if (routeParams?.newTaskAdded) {
          fetchTasks();
          // Reset the parameter so it doesn't refetch every time
          navigation.setParams({ newTaskAdded: false });
        } else {
          // Fetch tasks if not triggered by new task addition
          fetchTasks();
        }
      });
      return unsubscribe;
    }, [navigation])
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Fetch user profile data every time the screen is focused
      fetchUserProfile();

      // Check if a new task has been added
      if (route.params?.newTaskAdded) {
        fetchTasks();
        // Clear the parameter after fetching
        navigation.setParams({ newTaskAdded: false });
      }
    });

    return unsubscribe;
  }, [navigation, route.params?.newTaskAdded]);

  // header options
  React.useLayoutEffect(() => {
    const logoWidth = screenWidth * 0.5;
    const logoHeight = (logoWidth * 424) / 1500; 
    const headerHeight = logoHeight + 60; 

    navigation.setOptions({
      headerTitle: () => (
        <Image
          source={require('../assets/logo.png')}
          resizeMode="contain"
          style={{ width: logoWidth, height: logoHeight, marginVertical: 10 }}
        />
      ),
      headerStyle: {
        backgroundColor: '#0080FF',
        borderBottomWidth: 0,
        height: headerHeight,
      },
      headerTitleContainerStyle: {
        left: 0,
        right: 0,
      },
      headerShadowVisible: false,
    });
  }, [navigation]);

  // Function to fetch tasks
  const fetchTasks = async () => {
    if (auth.currentUser) {
      setLoading(true);
      const userId = auth.currentUser.uid;
  
      try {
        // Check AsyncStorage first
        const storedTasks = await AsyncStorage.getItem(`tasks_${userId}`);
        if (storedTasks !== null) {
          setTasks(JSON.parse(storedTasks));
        } else {
          // Fetch from Firebase if not in AsyncStorage
          const tasksQuery = firestoreQuery(
            collection(db, "tasks"),
            where("userId", "==", userId)
          );
  
          const querySnapshot = await getDocs(tasksQuery);
          const tasksArr = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
  
          setTasks(tasksArr);
          // Store fetched tasks in AsyncStorage
          await AsyncStorage.setItem(`tasks_${userId}`, JSON.stringify(tasksArr));
        }
      } catch (error) {
        console.error("Error fetching tasks: ", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // useFocusEffect to refresh tasks every time the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [])
  );

  // function to place completed task in completed database
  const completeTask = async (taskId, taskData) => {
    const userId = auth.currentUser.uid;
  
    try {
      // Update Firebase
      await addDoc(collection(db, "completed"), taskData);
      await deleteDoc(doc(db, "tasks", taskId));
  
      // Update local state and AsyncStorage
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      await AsyncStorage.setItem(`tasks_${userId}`, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error("Error completing task: ", error);
      Alert.alert("Error", "Unable to complete task.");
    }
  };

  // function to delete task
  const deleteTask = async (taskId) => {
    const userId = auth.currentUser.uid;
  
    try {
      // Update Firebase
      await deleteDoc(doc(db, "tasks", taskId));
  
      // Update local state and AsyncStorage
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      await AsyncStorage.setItem(`tasks_${userId}`, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error("Error deleting task: ", error);
      Alert.alert("Error", "Unable to delete task.");
    }
  };

  // function for rendering task
  const renderTask = ({ item }) => (
    <View style={styles.taskItem}>
      {/* container can be pressed, taking user to the edit task screen */}
      <TouchableOpacity onPress={() => navigation.navigate("EditTask", { taskId: item.id })}>
        {/* task title */}
        <Text style={styles.taskTitle}>{item.title}</Text>
        {/* task details */}
        <View style={styles.taskDetails}>
          {/* date */}
          <Text style={styles.dateTitle}>
            Due: {item.dueDate.toDate ? item.dueDate.toDate().toLocaleDateString() : new Date(item.dueDate.seconds * 1000).toLocaleDateString()}
          </Text>
          {/* priority */}
          <Text style={styles.priorityTitle}>Priority: {item.priority}</Text>
        </View>
        {/* description */}
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>
      {/* buttons */}
      <View style={styles.taskButtons}>
        {/* complete task */}
        <TouchableOpacity style={styles.completeButton} onPress={() => completeTask(item.id, item)}>
          <MaterialIcons name="check" size={24} color="white" />
        </TouchableOpacity>
        {/* delete task */}
        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTask(item.id)}>
          <MaterialIcons name="delete" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // function to navigate to add a new task
  const navigateToAddTask = () => {
    navigation.navigate("AddTask");
  };

  // return block
  return (
    <View style={styles.container}>
      {/* Greeting Section */}
      <View style={styles.greetingContainer}>
        {/* display Good time of day and user's first name */}
        <Text style={styles.greetingText}>
          Good {getPartOfDay()}, {profileData?.firstName || "User"}
        </Text>
        {/* display how many tasks user has currently */}
        <Text style={styles.taskCountText}>You have {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} currently</Text>
      </View>
      {loading ? (
        // Task loading indicator if no tasks entered
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
      ) : (
        // If tasks, display the tasks
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
        />
      )}
      {/* Button to navigate to a new task creation - AddTaskScreen */}
      <TouchableOpacity style={styles.fab} onPress={navigateToAddTask}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// StyleSheet
const styles = StyleSheet.create({
  // Container style
  container: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: '#0080FF', 
  },
  // Loading container style
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Greeting container style
  greetingContainer: {
    padding: 10,
    backgroundColor: '#0080FF', 
    width: '100%',
    alignItems: 'flex-start', 
    paddingHorizontal: 20, 
  },
  // Greeting text style
  greetingText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF', 
    marginBottom: 5, 
    // fontFamily: 'FiraSans_800ExtraBold_Italic',
  },
  // Task count text style
  taskCountText: {
    fontSize: 20,
    color: '#FFFFFF', 
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
  // Description box style
  descriptionBox: {
    backgroundColor: "#e0e0e0",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  // Description text style
  descriptionText: {
    fontSize: 16,
    color: "#333",
  },
  // Task buttons style
  taskButtons: {
    width: '100%', 
    flexDirection: "column", 
    marginTop: 10, 
  },
  // Complete button style
  completeButton: {
    backgroundColor: "#02DB1C",
    borderRadius: 5,
    padding: 10,
    width: '100%', 
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  // Delete button style
  deleteButton: {
    backgroundColor: "#F44336",
    borderRadius: 5,
    padding: 10,
    width: '100%',
    alignItems: "center",
    justifyContent: "center",
  },
  // Action button style
  fab: {
    position: "absolute",
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    elevation: 8,
  },
  // Action button icon style
  fabIcon: {
    fontSize: 50,
    color: "#0080FF",
    lineHeight: 56,
  },
});