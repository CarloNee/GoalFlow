// Import Section
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Alert, ActivityIndicator, Dimensions, Image } from 'react-native';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from "@expo/vector-icons";
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Export Completed Screen
export default function CompletedScreen({ navigation }) {
  // Declaration of functional components needed for Completed Screen
  // completed tasks and loading
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const screenWidth = Dimensions.get('window').width;
  const [profileData, setProfileData] = useState(null);
  

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

  // useFocusEffect to refresh tasks and user profile every time the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchUserProfile();
    }, [])
  );

  // Function to fetch user profile data
  const fetchUserProfile = async () => {
    const docRef = doc(db, "users", auth.currentUser.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setProfileData(docSnap.data());
    }
  };

  // useLayoutEffect for header
  React.useLayoutEffect(() => {
    fetchUserProfile();
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

  // header options
  React.useLayoutEffect(() => {
    const logoWidth = screenWidth * 0.5;
    const logoHeight = (logoWidth * 424) / 1500; 

    navigation.setOptions({
      headerTitle: () => (
        <Text style={styles.headerTitle}>Completed Tasks</Text>
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
  }, [navigation]);  

  const fetchCompletedTasks = async () => {
    // Setting loading state to true at the beginning of the function
    setLoading(true);
    const userId = auth.currentUser.uid;
    console.log("Fetching completed tasks for user ID:", userId);
  
    try {
      console.log("Fetching tasks from Firebase...");
      // Creating a query to fetch tasks from the 'completed' collection in Firebase Firestore
      const completedTasksQuery = query(collection(db, 'completed'), where('userId', '==', userId));
      
      // Executing the query and getting a snapshot of the data
      const querySnapshot = await getDocs(completedTasksQuery);
      console.log("Query Snapshot:", querySnapshot);
  
      if (!querySnapshot.empty) {
        // If the query returned data, map through each document in the snapshot
        const tasksArr = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Fetched Completed Tasks from Firebase:", tasksArr);
        
        // Setting the state with the fetched tasks array
        setCompletedTasks(tasksArr);
        
        // Updating AsyncStorage with the latest fetched data for offline access
        await AsyncStorage.setItem(`completedTasks_${userId}`, JSON.stringify(tasksArr));
      } else {
        // If no documents were returned by the query
        console.log("No completed tasks found in Firebase for this user.");
        
        // Clearing the tasks in the state if none were found in Firebase
        setCompletedTasks([]);
      }
    } catch (error) {
      // Handling any errors that occur during the fetch process
      console.error("Error fetching completed tasks: ", error);
      Alert.alert('Error', 'Unable to fetch completed tasks.');
    } finally {
      // Setting loading state to false at the end of the function
      setLoading(false);
    }
  };

  // function to render the completed task
  const renderCompletedTask = ({ item }) => (
    // task container
    <View style={styles.taskItem}>
        {/* Title of the completed Task */}
        <Text style={styles.taskTitle}>{item.title}</Text>
        {/* Task detail section */}
        <View style={styles.taskDetails}>
          {/* Text for the date */}
          <Text style={styles.dateTitle}>
            Due: {new Date(item.dueDate.seconds * 1000).toLocaleDateString()}
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
    </View>
  );

  // return block for the UI
  return (
    <View style={styles.container}>
      {/* If loding, show the loading tasks text */}
      {loading ? (
        // loading indicator
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
      ) : (
        // else show the tasks
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
    padding: 10,
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
  // Loading container style
  centeredContainer: {
    color: "#FFFFFF"
  },
  // Loading container style
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  // description text style
  descriptionText: {
    fontSize: 16,
    color: "#333",
  },
});
