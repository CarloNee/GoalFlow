// Import section
import React from 'react';
import renderer from 'react-test-renderer';
import { render, fireEvent } from '@testing-library/react-native';
import AddNoteScreen from './AddNoteScreen';
import AddTaskScreen from './AddTaskScreen';
import CompletedScreen from './CompletedScreen';
import EditTaskScreen from './EditTaskScreen';
import LoadingScreen from './LoadingScreen';
import LoginScreen from './LoginScreen';
import NoteDetailScreen from './NoteDetailScreen';
import NotesScreen from './NotesScreen';
import PreferencesScreen from './PreferencesScreen';
import ProfileScreen from './ProfileScreen';
import TasksScreen from './TasksScreen';
import RegisterScreen from './RegisterScreen';
import App from './App';

// Mock Navigation
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
  };
});

// Mock Firebase
jest.mock('./firebase', () => {
  // Define mock implementation
  return {
    
  };
});

// Tests
describe('React Native Application Tests', () => {

  // AddNoteScreen Tests
  describe('AddNoteScreen Tests', () => {
    it('renders correctly', () => {
      const tree = renderer.create(<AddNoteScreen />).toJSON();
      expect(tree).toMatchSnapshot();
    });

  });

  // AddTaskScreen Tests
  describe('AddTaskScreen Tests', () => {
    it('renders correctly', () => {
      const tree = renderer.create(<AddTaskScreen />).toJSON();
      expect(tree).toMatchSnapshot();
    });

  });

  // CompletedScreen Tests
  describe('CompletedScreen Tests', () => {
    it('renders correctly', () => {
      const tree = renderer.create(<CompletedScreen />).toJSON();
      expect(tree).toMatchSnapshot();
    });

  });

  // EditTaskScreen Tests
  describe('EditTaskScreen Tests', () => {
    it('renders correctly', () => {
      const tree = renderer.create(<EditTaskScreen />).toJSON();
      expect(tree).toMatchSnapshot();
    });

  });

  // LoadingScreen Tests
  describe('LoadingScreen Tests', () => {
    it('renders correctly', () => {
      const tree = renderer.create(<LoadingScreen />).toJSON();
      expect(tree).toMatchSnapshot();
    });

  });

  // LoginScreen Tests
  describe('LoginScreen Tests', () => {
    it('renders correctly', () => {
      const tree = renderer.create(<LoginScreen />).toJSON();
      expect(tree).toMatchSnapshot();
    });

  });

  // NoteDetailScreen Tests
  describe('NoteDetailScreen Tests', () => {
    it('renders correctly', () => {
      const tree = renderer.create(<NoteDetailScreen />).toJSON();
      expect(tree).toMatchSnapshot();
    });

  });

  // NotesScreen Tests
  describe('NotesScreen Tests', () => {
    it('renders correctly', () => {
      const tree = renderer.create(<NotesScreen />).toJSON();
      expect(tree).toMatchSnapshot();
    });

  });

  // PreferencesScreen Tests
  describe('PreferencesScreen Tests', () => {
    it('renders correctly', () => {
      const tree = renderer.create(<PreferencesScreen />).toJSON();
      expect(tree).toMatchSnapshot();
    });

  });

  // ProfileScreen Tests
  describe('ProfileScreen Tests', () => {
    it('renders correctly', () => {
      const tree = renderer.create(<ProfileScreen />).toJSON();
      expect(tree).toMatchSnapshot();
    });

  });

  // TasksScreen Tests
  describe('TasksScreen Tests', () => {
    it('renders correctly', () => {
      const tree = renderer.create(<TasksScreen />).toJSON();
      expect(tree).toMatchSnapshot();
    });

  });

  // RegisterScreen Tests
  describe('RegisterScreen Tests', () => {
    it('renders correctly', () => {
      const tree = renderer.create(<RegisterScreen />).toJSON();
      expect(tree).toMatchSnapshot();
    });

  });

});

