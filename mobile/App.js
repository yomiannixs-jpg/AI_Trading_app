import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
    return (
        <ThemeProvider>
          <AuthProvider>
            <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
            <AppNavigator />
          </AuthProvider>
        </ThemeProvider>
    );
};

export default App;