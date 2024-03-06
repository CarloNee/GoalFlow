// Import section
import React, { useState } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity, Text, SafeAreaView, ScrollView, Modal, Alert, Dimensions, Image } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { collection, query, where, getDocs, doc, deleteDoc, addDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Timestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

// Export AddTaskScreen
export default function AddTaskScreen({ navigation }) {

  // Declaration of functional components needed for AddTaskScreen
  //   title, due date, priority, description, subtasks
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [priority, setPriority] = useState("None");
  const [description, setDescription] = useState("");
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

    navigation.setOptions({
      headerTitle: () => (
        <Text style={styles.headerTitle}>New Task</Text>
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

  // function for Adding task to the databasw
  const handleAddTask = async () => {
    if (!title) {
      Alert.alert("Error", "Please enter a title for the task.");
      return;
    }
    // try catch block
    try {
      const newTask = {
        title,
        dueDate: Timestamp.fromDate(dueDate),
        priority,
        description,
        userId: auth.currentUser.uid,
      };
      
      // addDoc method to add new task to the 'tasks' collection
      const docRef = await addDoc(collection(db, "tasks"), newTask);
      newTask.id = docRef.id;
  
      // Alert and navigation
      Alert.alert("Success", "Task added successfully.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Tasks", { newTaskAdded: true })
        }
      ]);
  
      // Update AsyncStorage
      const userId = auth.currentUser.uid;
      const storedTasks = await AsyncStorage.getItem(`tasks_${userId}`);
      let tasksArray = storedTasks ? JSON.parse(storedTasks) : [];
      tasksArray.push(newTask);
      await AsyncStorage.setItem(`tasks_${userId}`, JSON.stringify(tasksArray));
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

  // return block for the UI
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Task title Text Input */}
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        {/* Task description Text Input */}
        <TextInput
          style={styles.inputDescription}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline // Allow multiple lines
          numberOfLines={4} // Set the initial number of lines
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

        {/* Add Task Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Text style={styles.addButtonText}>Add Task</Text>
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
  // Input style for all input fields
  input: {
    width: "100%",
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  // Input text style for all input fields
  inputText: {
    fontSize: 16,
    color: "#333",
  }, 
  // input description style
  inputDescription: {
    width: "100%",
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    minHeight: 100,
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
  // Add button style
  addButton: {
    backgroundColor: '#0080FF',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  // Add button text style
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
