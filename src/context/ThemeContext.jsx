import React, { createContext, useState, useContext, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';

const ThemeContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

export const themes = {
  light: {
    palette: {
      mode: 'light',
      primary: {
        main: '#00A3FF', // Bright Blue from screenshot
        light: '#E5F6FF',
        contrastText: '#fff',
      },
      secondary: {
        main: '#1a202c', // Dark grey/black for text
      },
      background: {
        default: '#f8f9fa', // Very light grey background
        paper: '#ffffff',
      },
      text: {
        primary: '#1a202c',
        secondary: '#718096',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 700,
        color: '#1a202c',
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        textTransform: 'none', // Cleaner look
        fontWeight: 600,
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
            borderRadius: '16px',
            border: '1px solid #edf2f7',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 4px 12px rgba(0, 163, 255, 0.2)',
            },
          },
        },
      },
       MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            fontWeight: 500,
          },
        },
      },
    },
  },
  dark: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#3399ff',
      },
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
    },
  },
  navy: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#00bcd4',
      },
      background: {
        default: '#0a1929',
        paper: '#001e3c',
      },
    },
  },
};

export const AppThemeProvider = ({ children }) => {
  const [currentThemeName, setCurrentThemeName] = useState('light');

  const theme = useMemo(() => {
    return createTheme(themes[currentThemeName] || themes.light);
  }, [currentThemeName]);

  const changeTheme = (name) => {
    if (themes[name]) {
      setCurrentThemeName(name);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentThemeName, changeTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
