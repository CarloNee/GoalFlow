// Import section
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TasksScreen from './screens/TasksScreen';
import AddTaskScreen from './screens/AddTaskScreen';
import NotesScreen from './screens/NotesScreen';
import ProfileScreen from './screens/ProfileScreen';
import CompletedScreen from './screens/CompletedScreen';

// create tab for createBottomTabNavigator
const Tab = createBottomTabNavigator();

// Export MainTabNavigator
export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            // Tasks for TasksScreen
            case 'Tasks':
              iconName = focused ? 'clipboard-text' : 'clipboard-text-outline';
              break;
            // Completed for the CompletedScreen
            case 'Completed':
              iconName = focused ? 'check-circle' : 'check-circle-outline';
              break;
            // Add Task for the AddTaskScreen
            case 'AddTask':
              iconName = 'plus-circle';
              size = 40;
              break;
            // Notes for the NotesScreen
            case 'Notes':
              iconName = focused ? 'notebook' : 'notebook-outline';
              break;
            // Profile for the ProfileScreen
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
          }
          // Batch return icons used for each Tab
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        // Tab active/inactive colors
        tabBarActiveTintColor: '#0080FF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      {/* Tabs used for different screens */}
      {/* Tasks */}
      <Tab.Screen name="Tasks" component={TasksScreen} options={{ headerShown: true }}/>
      {/* Completed */}
      <Tab.Screen name="Completed" component={CompletedScreen} />
      {/* Add Task */}
      <Tab.Screen 
        name="AddTask" 
        component={AddTaskScreen} 
        options={{
          tabBarLabel: 'Add Task',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="plus-circle" color={color} size={40} />
          ),
        }} 
      />
      {/* Notes */}
      <Tab.Screen name="Notes" component={NotesScreen} options={{ headerShown: true }}/>
      {/* Profile */}
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }}/>
    </Tab.Navigator>
  );
}
