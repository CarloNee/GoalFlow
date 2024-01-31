// Import section
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './StackNavigator';

// Export App
export default function App() {
  return (
    // Stack Navigator wrapped in Navigation Container
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
}

//stylesheet