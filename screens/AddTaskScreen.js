// Import section
import React, { useState } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity, Text, SafeAreaView, ScrollView, Modal, Alert, Dimensions } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Export AddTaskScreen
export default function AddTaskScreen({ navigation }) {

  // Declaration of functional components needed for AddTaskScreen
  //   title, due date, priority, description, subtasks, priority picker, Picker Visible
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [priority, setPriority] = useState("None");
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [isPickerModalVisible, setIsPickerModalVisible] = useState(false);
  const [description, setDescription] = useState("");
  const [subtasks, setSubtasks] = useState([]);

  // useLayoutEffect for the header options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Add a new task",
      headerStyle: {
        backgroundColor: '#0080FF',
      }, 
      headerTitleStyle: {
        color: 'white', 
      },
      headerTintColor: 'white',
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
        // add data to the database function - import and use addDoc
      // title, due date, priority, description, subtasks, userId to reference data to unique uid
        title,
        dueDate: Timestamp.fromDate(dueDate), 
        priority,
        description,
        subtasks,
        userId: auth.currentUser.uid,
      };
  
      const docRef = await addDoc(collection(db, "tasks"), newTask);
      newTask.id = docRef.id; // Set the newly created task ID
  
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

  // fucntion to render subtasks input section 
  // needs work as currently not able to add subtasks
  const renderSubtaskInputs = () => {
    return subtasks.map((subtask, index) => (
      <TextInput
        key={index}
        style={styles.input}
        placeholder={`Subtask ${index + 1}`}
        value={subtask}
        onChangeText={(text) => {
          const newSubtasks = [...subtasks];
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
          style={styles.input}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
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
              <TouchableOpacity style={styles.modalButton} onPress={handlePickerModalToggle} >
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>
              {/* Priority options */}
              <Picker selectedValue={priority} style={styles.picker} onValueChange={(itemValue) => setPriority(itemValue)} >
                <Picker.Item label="None" value="None" />
                <Picker.Item label="Low" value="Low" />
                <Picker.Item label="Medium" value="Medium" />
                <Picker.Item label="High" value="High" />
              </Picker>
            </View>
          </View>
        </Modal>

        {/* Subtasks Inputs */}
        {renderSubtaskInputs()}

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
    backgroundColor: '#0080FF', 
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
  // Container style for the date picker
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    alignItems: 'center', 
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
  // Add button style
  addButton: {
    backgroundColor: "#03A9F4",
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
