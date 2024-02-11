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
import ProfileScreen from './ProfileScreen';
import TasksScreen from './TasksScreen';
import RegisterScreen from './RegisterScreen';

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
jest.mock('../firebase', () => {
  return {
    auth: {
      currentUser: {
        uid: 'testUid'
      }
    },
    db: {},
    collection: jest.fn(),
    getDocs: jest.fn(),
    addDoc: jest.fn(),
    deleteDoc: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    Timestamp: {
      fromDate: jest.fn(),
      now: jest.fn(),
    },
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Tests for different screens
describe('React Native Application Tests', () => {

  // AddNoteScreen Tests
  describe('AddNoteScreen Tests', () => {
    // renders correctly - match to snapshot
    it('renders correctly', () => {
      const tree = renderer.create(<AddNoteScreen />).toJSON();
      expect(tree).toMatchSnapshot();
    });
    
    // test to see if the placeholder text renders correctly
    it('renders the input fields correctly', () => {
      const { getByPlaceholderText } = render(<AddNoteScreen />);
      expect(getByPlaceholderText('Title')).toBeTruthy();
      expect(getByPlaceholderText('Write your note here...')).toBeTruthy();
    });

    // test the alert for note saved if button pressed
    it('shows an alert if the save button is pressed with empty fields', () => {
      const { getByText } = render(<AddNoteScreen />);
      const saveButton = getByText('Save');
      fireEvent.press(saveButton);
    });

  });

  // AddTaskScreen Tests
  describe('AddTaskScreen Tests', () => {
    // renders correctly - match to snapshot
    it('renders correctly', () => {
      const tree = renderer.create(<AddTaskScreen />).toJSON();
      expect(tree).toMatchSnapshot();
    });

    // Test for the date picker package shown  
    it('shows the DatePicker when due date field is pressed', () => {
      const { getByTestId } = render(<AddTaskScreen />);
      fireEvent.press(getByTestId('due-date-picker'));
      expect(getByTestId('date-picker-modal')).toBeTruthy();
    });
  
    // Test for the hanleAddTask function
    it('calls the handleAddTask function when add task button is pressed', () => {
      const { getByText } = render(<AddTaskScreen />);
      fireEvent.press(getByText('Add Task'));
      expect(handleAddTask).toHaveBeenCalled();
    });

  });

  // CompletedScreen Tests
  describe('CompletedScreen Tests', () => {
    // test for loading indicator
    it('renders the loading indicator initially', () => {
      const { getByTestId } = render(<CompletedScreen />);
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });
    
    // test for rendering completed tasks
    it('renders the list of completed tasks', async () => {
      const { getByText } = render(<CompletedScreen />);
      await waitFor(() => {
        expect(getByText('Task 1')).toBeTruthy();
        expect(getByText('Description 1')).toBeTruthy();
      });
    });
    
    // test for message displayed if no completed tasks
    it('displays no tasks message when the list is empty', async () => {
      getDocs.mockImplementationOnce(() => Promise.resolve({ docs: [] }));
      
      const { getByText } = render(<CompletedScreen />);
      await waitFor(() => {
        expect(getByText('No completed tasks')).toBeTruthy();
      });
    });
  });

  // EditTaskScreen Tests
  describe('EditTaskScreen Tests', () => {
    // renders correctly - match to snapshot
    it('renders correctly', () => {
      const tree = renderer.create(<EditTaskScreen />).toJSON();
      expect(tree).toMatchSnapshot();
    });

  });

  // LoadingScreen Tests
  describe('LoadingScreen Tests', () => {
    // test for loading animation on screen
    beforeEach(() => {
      jest.spyOn(Animated, 'timing').mockReturnValue({
        start: jest.fn(),
      });
    });
    
    // test for loading screen rendering correctly
    it('renders correctly', () => {
      const { getByTestId } = render(<LoadingScreen />);
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });
    
    // test for navigation to home when auth completed and user is authenticated
    it('navigates to Home when user is authenticated', async () => {
      getAuth.mockImplementation(() => ({
        currentUser: { uid: 'testUid' },
      }));

      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(auth.currentUser);
      });
  
      const { getByTestId, getByText } = render(<LoadingScreen />);
      await waitFor(() => {
        expect(getByTestId('navigation-home')).toBeTruthy();
      });
    });
  
    // test for navigation to login screen if user is not authenticated
    it('navigates to Login when user is not authenticated', async () => {
      getAuth.mockImplementation(() => ({
        currentUser: null,
      }));

      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(auth.currentUser);
      });
  
      const { getByTestId } = render(<LoadingScreen />);
      await waitFor(() => {
        expect(getByTestId('navigation-login')).toBeTruthy();
      });
    });
  });

  // LoginScreen Tests
  describe('LoginScreen Tests', () => {
    // test for rendering the login fields, placeholder and button
    it('renders the login inputs and buttons', () => {
      const { getByPlaceholderText, getByText } = render(<LoginScreen />);
      
      expect(getByPlaceholderText('Email')).toBeTruthy();
      expect(getByPlaceholderText('Password')).toBeTruthy();
      expect(getByText('Log In')).toBeTruthy();
    });
    
    // test the loading indicator 
    it('shows loading indicator when login is in progress', async () => {
      const { getByText, queryByTestId } = render(<LoginScreen />);
      fireEvent.press(getByText('Log In'));
      
      await waitFor(() => {
        expect(queryByTestId('loading-indicator')).toBeTruthy();
      });
    });
    
    // test for navigation to register screen if register touchable is pressed 
    it('navigates to Register when the respective text is pressed', () => {
      const { getByText } = render(<LoginScreen />);
      fireEvent.press(getByText('Don\'t have an account? Register'));
      
      expect(mockNavigate).toHaveBeenCalledWith('Register');
    });
  
    // tests for navigation to password reset screen if forgot password touchable is pressed
    it('navigates to PasswordReset when the respective text is pressed', () => {
      const { getByText } = render(<LoginScreen />);
      fireEvent.press(getByText('Forgot Password?'));
      
      expect(mockNavigate).toHaveBeenCalledWith('PasswordReset');
    });

  });

  // NoteDetailScreen Tests
  describe('NoteDetailScreen Tests', () => {
    // test if notedetailscreen renders correctly
    it('renders correctly', () => {
      const tree = renderer.create(<NoteDetailScreen />).toJSON();
      expect(tree).toMatchSnapshot();
    });

    // Test to see if empty content is rendered if no input provided
    it('renders with initial empty content', () => {
      const { getByPlaceholderText } = render(<NoteDetailScreen />);
      expect(getByPlaceholderText('Write your note...')).toBeTruthy();
    });

  });

  // NotesScreen Tests
  describe('NotesScreen Tests', () => {
    // test if notes screen renders correctly
    it('renders correctly', () => {
      const tree = renderer.create(<NotesScreen />).toJSON();
      expect(tree).toMatchSnapshot();
    });

    // test if notes render correctly
    it('renders the notes when available', () => {
      const notesMockData = [{ id: '1', title: 'Test Note', content: 'This is a test' }];
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(notesMockData));
      const { getByText } = render(<NotesScreen />);
      expect(getByText('Test Note')).toBeTruthy();
    });
    
    // test if deleteNote function is called
    it('calls deleteNote function when delete icon is pressed', () => {
      const { getByTestId } = render(<NotesScreen />);
      fireEvent.press(getByTestId('delete-note-1'));
      expect(deleteNote).toHaveBeenCalledWith('1');
    });

  });

  // ProfileScreen Tests
  describe('ProfileScreen Tests', () => {
    // tests if profile screen renders correctly
    it('renders correctly', () => {
      const tree = renderer.create(<ProfileScreen />).toJSON();
      expect(tree).toMatchSnapshot();
    });

    // test if the user's profile data is displayed
    it('displays user profile data if present', () => {
      const { getByText } = render(<ProfileScreen profileData={profileData} />);
      expect(getByText(profileData.firstName)).toBeTruthy();
      expect(getByText(profileData.lastName)).toBeTruthy();
    });

    // test if default image is shown when there is no photo URL
    it('displays default image when no profile photo is available', () => {
      const { getByTestId } = render(<ProfileScreen />);
      expect(getByTestId('default-profile-image')).toBeTruthy();
    });

    // test if the save profile button is rendered
    it('renders a save profile button', () => {
      const { getByTestId } = render(<ProfileScreen />);
      expect(getByTestId('save-profile-button')).toBeTruthy();
    });

    // test if the logout button is rendered
    it('renders a logout button', () => {
      const { getByTestId } = render(<ProfileScreen />);
      expect(getByTestId('logout-button')).toBeTruthy();
    });

    // test if the delete account button is rendered
    it('renders a delete account button', () => {
      const { getByTestId } = render(<ProfileScreen />);
      expect(getByTestId('delete-account-button')).toBeTruthy();
    });

    // Check if the app version is displayed correctly
    it('displays the correct app version', () => {
      const { getByText } = render(<ProfileScreen />);
      const appVersion = Constants.expoConfig.version;
      expect(getByText(`App Version: ${appVersion}`)).toBeTruthy();
    });

  });

  // TasksScreen Tests
  describe('TasksScreen Tests', () => {
    // test if tasks screen renders correctly
    it('renders correctly', () => {
      const tree = renderer.create(<TasksScreen />).toJSON();
      expect(tree).toMatchSnapshot();
    });

    // test to render the greeting message correctly - changing variable for morning, afternoon, evening
    it('renders the greeting message with the correct part of the day', () => {
      const { getByText } = render(<TasksScreen />);
      const partOfDay = new Date().getHours() < 12 ? 'morning' : (new Date().getHours() < 18 ? 'afternoon' : 'evening');
      expect(getByText(`Good ${partOfDay}, User`)).toBeTruthy();
    });

    // test whether add task button directs user to the add task screen
    it('navigates to AddTaskScreen when add task button is pressed', () => {
      const { getByTestId } = render(<TasksScreen />);
      fireEvent.press(getByTestId('add-task-button'));
      expect(mockNavigate).toHaveBeenCalledWith('AddTask');
    });
  });

  // RegisterScreen Tests
  describe('RegisterScreen Tests', () => {
    // test if register screen renders correctly
    it('renders correctly', () => {
      const tree = renderer.create(<RegisterScreen />).toJSON();
      expect(tree).toMatchSnapshot();
    });

    // test if the input fields are empty
    it('initializes with empty input fields', () => {
      const { getByPlaceholderText } = render(<RegisterScreen />);
      expect(getByPlaceholderText('First Name').props.value).toEqual('');
      expect(getByPlaceholderText('Surname').props.value).toEqual('');
      expect(getByPlaceholderText('Email').props.value).toEqual('');
      expect(getByPlaceholderText('Password').props.value).toEqual('');
    });

    // test if the sign-up button renders and can be pressed
    it('renders a sign-up button that can be pressed', () => {
      const { getByText } = render(<RegisterScreen />);
      const signUpButton = getByText('Sign Up');
      fireEvent.press(signUpButton);
    });

    // test if loading indicator renders
    it('displays a loading indicator when in loading state', () => {
      const { getByTestId } = render(<RegisterScreen loading={true} />);
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    // test navigation to login screen if already a member touchable is pressed
    it('navigates to LoginScreen when already a member is pressed', () => {
      const navigate = jest.fn();
      const { getByText } = render(<RegisterScreen navigation={{ navigate }} />);
      fireEvent.press(getByText('Already a member? Log in here'));
      expect(navigate).toHaveBeenCalledWith('Login');
    });

  });

});

