import React, { createContext, useContext, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(false);
  const value = useMemo(() => ({
    dark,
    toggleTheme: () => setDark(current => !current),
    colors: dark
      ? { background: '#121212', surface: '#1e1e1e', text: '#ffffff', primary: '#64b5f6' }
      : { background: '#f8f9fa', surface: '#ffffff', text: '#222222', primary: '#2196F3' }
  }), [dark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
};
