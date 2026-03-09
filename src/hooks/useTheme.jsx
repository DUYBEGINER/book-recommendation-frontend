import { useContext } from 'react';
import { ThemeContext } from '../contexts/Theme/ThemeContext';

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeContext must be used within ThemeProvider');
  return context;
};