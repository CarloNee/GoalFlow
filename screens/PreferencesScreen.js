// Import Section
import React from 'react';
import { View, StyleSheet, Text, Switch } from 'react-native';

// Export PreferencesScreen
export default function PreferencesScreen() {
  // declaration of functional components
  // notifications enabled, light mode / dark mode
  // Resource: https://react.dev/reference/react/useState
  const [isNotificationsEnabled, setIsNotificationsEnabled] = React.useState(false);
  const toggleSwitch = () => setIsNotificationsEnabled(previousState => !previousState);

  // return block
  return (
    <View style={styles.container}>
      {/* Enable notifications switch */}
      <Text style={styles.text}>Enable Notifications</Text>
      <Switch
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={isNotificationsEnabled ? "#f5dd4b" : "#f4f3f4"}
        onValueChange={toggleSwitch}
        value={isNotificationsEnabled}
      />
    </View>
  );
}

// StyleSheet
const styles = StyleSheet.create({
  // Container style
  container: {
    flex: 1,
    padding: 20,
  },
  // Text styling
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
});
