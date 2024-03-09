// Import Section
import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity, Text, Alert, ScrollView, SafeAreaView, Dimensions, Image, Button, Modal } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

// Export EditTaskScreen
export default function EditTaskScreen({ route, navigation }) {
  // Resource: https://react.dev/reference/react/useState
  const { taskId } = route.params;
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const [profileData, setProfileData] = useState(null);
  const screenWidth = Dimensions.get("window").width;

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
      // header right side options (Profile Picture using photoURL from firebase)
      headerRight: () =>
        profileData?.photoURL ? (
          <Image
            source={{ uri: profileData.photoURL }}
            style={styles.profileImage}
          />
        ) : (
          <MaterialIcons name="account-circle" size={40} color="#fff" />
        ),
        // header left side option - back button
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Tasks")}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      ),
      headerRightContainerStyle: styles.headerRightContainer,
      // header title section - edit task
      headerTitle: () => <Text style={styles.headerTitle}>Edit Task</Text>,
      headerStyle: {
        backgroundColor: "#0080FF",
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
        // get data from tasks database
        // Resource: https://firebase.google.com/docs/firestore/query-data/get-data#get_a_document
        const docRef = doc(db, "tasks", taskId);
        const docSnap = await getDoc(docRef);
        
        // if document exists, update title, priority and description
        if (docSnap.exists()) {
          const task = docSnap.data();
          setTitle(task.title);
          setPriority(task.priority);
          setDescription(task.description);

          // Convert Firestore Timestamp to JavaScript Date object
          const firestoreDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate.seconds * 1000);
          setDueDate(firestoreDate);
        } else {
          // if no task found in document, yield error
          Alert.alert("Error", "Task not found.");
          // go back to tasks
          navigation.navigate("Tasks");
        }
      } catch (error) {
        Alert.alert("Error", error.message);
      }
    };

    fetchTask();
  }, [taskId, navigation]);

  // function to handle updating tasks
  const handleUpdateTask = async () => {
    // if no title, yield error to advise to enter a title
    if (!title) {
      Alert.alert("Error", "Please enter a title for the task.");
      return;
    }

    try {
      // Convert JavaScript Date to Firestore Timestamp
      const firestoreTimestamp = Timestamp.fromDate(dueDate);

      const taskRef = doc(db, "tasks", taskId);

      // update the data in the collection
      await updateDoc(taskRef, {
        title,
        dueDate: firestoreTimestamp,
        priority,
        description,
      });

      // alert user task was updated successfully
      Alert.alert("Success", "Task updated successfully.");

      // Go back to TasksScreen & update taskUpdated to true
      navigation.goBack();
      navigation.navigate("Tasks", { taskUpdated: true });
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // Function to handle priority selection
  const selectPriority = (selectedPriority) => {
    setPriority(selectedPriority);
  };

  // Get style based on priority
  const getPriorityStyle = (prio) => {
    switch (prio) {
      case "None":
        return { backgroundColor: '#8c8f8d', textColor: '#f0f0f0' };
      case "Low":
        return { backgroundColor: '#3cde72', textColor: '#d4f2e7' };
      case "Medium":
        return { backgroundColor: '#de953c', textColor: '#f3e1cb' };
      case "High":
        return { backgroundColor: '#db2121', textColor: '#f3c1c1' };
      default:
        return { backgroundColor: '#e0e0e0', textColor: '#333' };
    }
  };

  // Render function for EditTaskScreen
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>

        {/* Title input field */}
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />

        {/* Description input field */}
        <TextInput
          style={[styles.input, styles.inputDescription]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        {/* Due Date Picker and Label */}
        <View style={styles.datePickerContainer}>
          <Text style={styles.datePickerLabel}>Due Date:</Text>
          <DateTimePicker
            style={styles.datePicker}
            value={dueDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setDueDate(selectedDate || dueDate);
            }}
          />
        </View> 

        {/* Priority Selection */}
        <View style={styles.prioritySelectionContainer}>
          <Text style={styles.priorityLabel}>Priority:</Text>
          <View style={styles.priorityOptions}>
            {["None", "Low", "Medium", "High"].map((prio, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.priorityOption,
                  { backgroundColor: priority === prio ? getPriorityStyle(prio).backgroundColor : 'transparent' }
                ]}
                onPress={() => selectPriority(prio)}
              >
                <Text style={[
                  styles.priorityOptionText,
                  { color: priority === prio ? getPriorityStyle(prio).textColor : '#333' }
                ]}>
                  {prio}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
    backgroundColor: '#f7f7f7', 
  },
  // Header title style
  headerTitle: {
    textAlign: "center",
    fontFamily: "FiraSans-ExtraBoldItalic",
    fontSize: 25,
    color: "#fff",
  },
  // Profile image style
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  // Header left back button style
  backButton: {
    marginLeft: 10,
  },
  // Header right container style
  headerRightContainer: {
    paddingRight: 10,
  },
  // Header title container style
  headerTitleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    width: "100%",
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  // input description individual style
  inputDescription: {
    minHeight: 120,
  },
  // date picker container style
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
  },
  // date picker label style
  datePickerLabel: {
    fontSize: 16,
    color: "#333",
  },
  // date picker style
  datePicker: {
    flex: 1,
  },
  // priority selection container style
  prioritySelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  // priority label style
  priorityLabel: {
    fontSize: 16,
    color: "#333",
    marginRight: 10,
  },
  // priority options style
  priorityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
  },
  // priority option selected style
  priorityOption: {
    padding: 10,
    borderRadius: 10,
    width: '25%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  // priority option text style
  priorityOptionText: {
    fontSize: 15,
  },
  // Update task button styling
  buttonContainer: {
    backgroundColor: '#0080FF',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  // Button text style
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
