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

  // Function to render completed tasks
  const renderCompletedTask = ({ item }) => {
    const priorityStyle = getPriorityStyle(item.priority); 
    return (
      // Task container
      <View style={styles.taskItem}>
        {/* title for the task */}
        <Text style={styles.taskTitle}>{item.title}</Text>
        {/* Task details section */}
        <View style={styles.taskDetails}>
          {/* Task due date */}
          <Text style={styles.dateTitle}>Due: {item.dueDate.toLocaleDateString()}</Text>
            {/* priority */}
            <View style={styles.priorityContainer}>
              <View style={[styles.priorityCircle, { backgroundColor: priorityStyle.circleColor }]} />
              <Text style={{ ...styles.priorityTitle, color: priorityStyle.color }}>
                {item.priority}
              </Text>
            </View>
        </View>
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>{item.description}</Text>
        </View>
      </View>
    )
  };

  // Render function for CompletedScreen
  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : completedTasks.length === 0 ? (
        // Display "No completed tasks" when there are no tasks
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No completed tasks...</Text>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Empty container text style
  emptyText: {
    fontSize: 25,
    color: '#FFFFFF',
  },
});
