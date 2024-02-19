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
  const { taskId } = route.params;
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const [subtasks, setSubtasks] = useState([]);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [isPickerModalVisible, setIsPickerModalVisible] = useState(false);
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
      headerRight: () =>
        profileData?.photoURL ? (
          <Image
            source={{ uri: profileData.photoURL }}
            style={styles.profileImage}
          />
        ) : (
          <MaterialIcons name="account-circle" size={40} color="#fff" />
        ),
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Tasks")}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      ),
      headerRightContainerStyle: styles.headerRightContainer,
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
        const docRef = doc(db, "tasks", taskId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const task = docSnap.data();
          setTitle(task.title);
          setPriority(task.priority);
          setDescription(task.description);
          setSubtasks(task.subtasks || []);

          // Convert Firestore Timestamp to JavaScript Date object
          const firestoreDate = task.dueDate.toDate
            ? task.dueDate.toDate()
            : new Date(task.dueDate.seconds * 1000);
          setDueDate(firestoreDate);
        } else {
          Alert.alert("Error", "Task not found.");
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
        subtasks,
      });

      Alert.alert("Success", "Task updated successfully.");

      // Go back to TasksScreen and indicate that a task has been updated
      navigation.goBack();
      navigation.navigate("Tasks", { taskUpdated: true });
    } catch (error) {
      Alert.alert("Error", error.message);
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

  // function for toggling the 'priority picker' using the PickerModal
  const handlePickerModalToggle = () => {
    setIsPickerModalVisible(!isPickerModalVisible);
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

        {/* Date Picker */}
        <View style={styles.datePickerContainer}>
          <Text>Due Date:</Text>
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

        {/* Priority Modal Touchable Opacity for user to press on the Priority Modal */}
        <TouchableOpacity
          style={styles.priorityField}
          onPress={handlePickerModalToggle}
        >
          {/* If no priority selected, priority is none */}
          <Text style={styles.inputText}>
            {priority !== "None" ? priority : "Select Priority"}
          </Text>
        </TouchableOpacity>

        {/* Priority Picker Modal */}
        <Modal
          transparent={true}
          visible={isPickerModalVisible}
          onRequestClose={handlePickerModalToggle}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handlePickerModalToggle}
              >
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>
              {/* Priority options */}
              <Picker
                selectedValue={priority}
                style={styles.picker}
                onValueChange={(itemValue) => setPriority(itemValue)}
              >
                <Picker.Item label="None" value="None" />
                <Picker.Item label="Low" value="Low" />
                <Picker.Item label="Medium" value="Medium" />
                <Picker.Item label="High" value="High" />
              </Picker>
            </View>
          </View>
        </Modal>

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
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={handleUpdateTask}
        >
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
    backgroundColor: "#0080FF",
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
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  // Container style for the date picker
  datePickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    alignItems: "center",
  },
  // Date Picker style
  datePicker: {
    width: "100%",
    padding: 10,
    marginVertical: 10,
  },
  // Priority Field style
  priorityField: {
    width: "100%",
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  // Picker style
  picker: {
    width: "100%",
    height: 150,
  },
  // Modal Container Style
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  // Modal Content Style
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  // Modal button style
  modalButton: {
    alignItems: "center",
    marginTop: 10,
  },
  // Modal button text style
  modalButtonText: {
    fontSize: 18,
    color: "#007AFF",
  },
  // Update task button styling
  buttonContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  // Button text style
  buttonText: {
    color: "#0080FF",
    fontSize: 18,
  },
});
