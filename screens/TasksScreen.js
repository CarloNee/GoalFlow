// Import section
import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Text, TextInput, TouchableOpacity, Alert, Image, Dimensions, ActivityIndicator, RefreshControl } from "react-native";
import { db, auth } from "../firebase";
import { collection, query as firestoreQuery, where, getDocs, doc, deleteDoc, addDoc, getDoc, Timestamp } from "firebase/firestore";
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from "@expo/vector-icons";
// import { useFonts, FiraSans_800ExtraBold_Italic } from '@expo-google-fonts/fira-sans';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
// Celebration animation taken from https://lottiefiles.com/animations/bluecomplete-xFRAfv5Wy9?from=search. Credit to the Author for creating the animation and the JSON file
import celebrationAnimation from '../celebration.json';
import ConfettiCannon from 'react-native-confetti-cannon';

// Export TasksScreen
export default function TasksScreen({ navigation, route }) {

  // declaration of functional components
  // tasks, loading, profile data
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const [showCelebration, setShowCelebration] = useState(false);

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
  
        // Get route parameters
        const routeParams = navigation.getState().routes.find(route => route.name === 'Tasks')?.params;
        console.log('Route Params:', routeParams);
        // Check if a new task has been added or a task has been updated
        if (routeParams?.newTaskAdded || routeParams?.taskUpdated) {
          fetchTasks();
          console.log('Route Params:', routeParams);
          // Reset the parameters so it doesn't refetch every time
          navigation.setParams({ newTaskAdded: false, taskUpdated: false });
        } else {
          // Fetch tasks if not triggered by new task addition or update
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
        // Fetch from Firebase
        const tasksQuery = firestoreQuery(
          collection(db, "tasks"),
          where("userId", "==", userId)
        );

        const querySnapshot = await getDocs(tasksQuery);
        const tasksArr = querySnapshot.docs.map(doc => ({ id: doc.id,...doc.data(),}));

        setTasks(tasksArr);
        // Update AsyncStorage with the latest data
        await AsyncStorage.setItem(`tasks_${userId}`, JSON.stringify(tasksArr));
      } catch (error) {
        console.error("Error fetching tasks: ", error);
        // Fall back to using AsyncStorage data in case of an error
        const storedTasks = await AsyncStorage.getItem(`tasks_${userId}`);
        if (storedTasks !== null) {
          setTasks(JSON.parse(storedTasks));
        }
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

// Function to mark a task as completed
const completeTask = async (taskId, taskData) => {
  const userId = auth.currentUser.uid;

  try {
    // Convert the JavaScript Date object to Firestore Timestamp
    const firestoreTimestamp = taskData.dueDate instanceof Date ? 
      Timestamp.fromDate(taskData.dueDate) : 
      new Timestamp(taskData.dueDate.seconds, taskData.dueDate.nanoseconds);

    // Prepare the task data for storage in the 'completed' collection
    const completedTaskData = {
      ...taskData,
      dueDate: firestoreTimestamp
    };

    // Add to the 'completed' collection and delete from the 'tasks' collection
    await addDoc(collection(db, "completed"), completedTaskData);
    await deleteDoc(doc(db, "tasks", taskId));

    // Update local state and AsyncStorage (if necessary)
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    await AsyncStorage.setItem(`tasks_${userId}`, JSON.stringify(updatedTasks));
    setShowCelebration(true); 
    setTimeout(() => setShowCelebration(false), 3000);
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

  // Function to get priority style based on priority
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "None":
        return { color: '#8c8f8d', circleColor: '#8c8f8d' };
      case "Low":
        return { color: '#3cde72', circleColor: '#3cde72' };
      case "Medium":
        return { color: '#de953c', circleColor: '#de953c' };
      case "High":
        return { color: '#db2121', circleColor: '#db2121' };
      default:
        return { color: '#e0e0e0', circleColor: '#e0e0e0' };
    }
  };

  // function for rendering task
  const renderTask = ({ item }) => {
    const priorityStyle = getPriorityStyle(item.priority);
    return (
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
            <View style={styles.priorityContainer}>
              <View style={[styles.priorityCircle, { backgroundColor: priorityStyle.circleColor }]} />
              <Text style={{ ...styles.priorityTitle, color: priorityStyle.color }}>
                {item.priority}
              </Text>
            </View>
          </View>
          {/* description */}
          <TextInput
            style={styles.descriptionInput}
            value={item.description}
            editable={false} 
            multiline
            numberOfLines={4} 
          />
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
  };

  // function to navigate to add a new task
  const navigateToAddTask = () => {
    navigation.navigate("AddTask");
  };

  // function for controlling the pulldown refresh action
const onRefresh = React.useCallback(async () => {
  setRefreshing(true);
  console.log("Refreshing tasks...");
  await fetchTasks();
  setRefreshing(false);
}, [fetchTasks]);

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />
      )}
      {/* Button to navigate to a new task creation - AddTaskScreen */}
      <TouchableOpacity style={styles.fab} onPress={navigateToAddTask}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
      {/* lottie celebration for the completed task */}
      {showCelebration && (
      <>
      {/* lottie celebration */}
        <LottieView
          source={celebrationAnimation}
          autoPlay
          loop={false}
          style={styles.celebrationAnimation}
        />
        {/* confetti celebration for completed task */}
        <ConfettiCannon count={200} origin={{x: -10, y: 0}} fadeOut={true} />
      </>
    )}
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
  // description input text style
  descriptionInput: {
    backgroundColor: '#e0e0e0', 
    padding: 15, 
    borderRadius: 10,
    minHeight: 100, 
    fontSize: 16,
    color: "#333",
  },
  // Date title style
  dateTitle: {
    fontSize: 16,
    color: "#333",
  },
  // priority container style
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // priority circle style
  priorityCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  // priority titlestyle
  priorityTitle: {
    fontSize: 16,
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
  // celebration animation style
  celebrationAnimation: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});