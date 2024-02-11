// Import Section
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Alert, ActivityIndicator, Dimensions, Image } from 'react-native';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from "@expo/vector-icons";
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
    }, [])
  );

  // useFocusEffect for fetching user profile data
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

  // Header setup with user profile
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
    
// Function to fetch completed tasks from Firebase and store them in local AsyncStorage
const fetchCompletedTasks = async () => {
  // setLoading - true
  setLoading(true);

  // Retrieve the unique user ID 
  const userId = auth.currentUser.uid;

  try {
    // query to retrieve tasks marked as completed by the current user
    const completedTasksQuery = query(collection(db, 'completed'), where('userId', '==', userId));

    const querySnapshot = await getDocs(completedTasksQuery);

    // Check if the query returned any documents
    if (!querySnapshot.empty) {
      // Transform the query results into an array of task objects
      const tasksArr = querySnapshot.docs.map(doc => {
        const task = doc.data();
        // Convert Firestore Timestamp to a JavaScript Date object for display
        const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate.seconds * 1000);
        // Return a task object including the document ID and the formatted due date
        return { id: doc.id, ...task, dueDate };
      });

      // Update the state with the fetched tasks array
      setCompletedTasks(tasksArr);
      // Store the fetched tasks in AsyncStorage
      await AsyncStorage.setItem(`completedTasks_${userId}`, JSON.stringify(tasksArr));
    } else {
      // If no tasks were returned, set the completed tasks state to an empty array
      setCompletedTasks([]);
    }
  } catch (error) {
    // Alert if error occurs
    Alert.alert('Error', 'Unable to fetch completed tasks.');
  } finally {
    //setloading to false once completed
    setLoading(false);
  }
};

  // Function to render completed tasks
  const renderCompletedTask = ({ item }) => (
    <View style={styles.taskItem}>
      <Text style={styles.taskTitle}>{item.title}</Text>
      <View style={styles.taskDetails}>
        <Text style={styles.dateTitle}>Due: {item.dueDate.toLocaleDateString()}</Text>
        <Text style={styles.priorityTitle}>Priority: {item.priority}</Text>
      </View>
      <View style={styles.descriptionBox}>
        <Text style={styles.descriptionText}>{item.description}</Text>
      </View>
    </View>
  );

  // Render function for CompletedScreen
  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : (
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
