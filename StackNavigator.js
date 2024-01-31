// Import section
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainTabNavigator from './MainTabNavigator';
import LoadingScreen from './screens/LoadingScreen';
import AddTaskScreen from './screens/AddTaskScreen';
import EditTaskScreen from './screens/EditTaskScreen';
import AddNoteScreen from './screens/AddNoteScreen';
import NoteDetailScreen from './screens/NoteDetailScreen';
import LoginScreen from './screens/LoginScreen';
import PasswordResetScreen from './screens/PasswordResetScreen';
import RegisterScreen from './screens/RegisterScreen';
import PreferencesScreen from './screens/PreferencesScreen';

// variable stack = createStackNavigator
const Stack = createStackNavigator();

// Export StackNavigator
export default function StackNavigator() {
  return (
    <Stack.Navigator>
      {/* Loading Screen */}
      <Stack.Screen name="Loading" component={LoadingScreen} options={{ headerShown: false }} />
      {/* Login Screen */}
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      {/* Password Reset Screen */}
      <Stack.Screen name="PasswordReset" component={PasswordResetScreen} options={{ headerShown: false }} />
      {/* Register Screen */}
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }}/>
      {/* Preferences Screen */}
      <Stack.Screen name="Preferences" component={PreferencesScreen} options={{ headerShown: true }} />
      {/* Main Tab Navigator */}
      <Stack.Screen name="Home" component={MainTabNavigator} options={{ headerShown: false }} />
      {/* Add Task Screen */}
      <Stack.Screen name="Add Task" component={AddTaskScreen} options={{ headerShown: true }} />
      {/* Edit Task Screen */}
      <Stack.Screen name="EditTask" component={EditTaskScreen} options={{ headerShown: true }} />
      {/* Add Note Screen */}
      <Stack.Screen name="AddNote" component={AddNoteScreen} options={{ headerShown: true }} />
      {/* Note Detail Screen */}
      <Stack.Screen name="NoteDetail" component={NoteDetailScreen} options={{ headerShown: true }} />
    </Stack.Navigator>
  );
}
