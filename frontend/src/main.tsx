import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Toaster } from 'react-hot-toast'
import App from './App'

// Google Material Design inspired theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4285f4', // Google Blue
      light: '#70a7ff',
      dark: '#0d47a1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#34a853', // Google Green
      light: '#68d988',
      dark: '#0d7c2d',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ea4335', // Google Red
    },
    warning: {
      main: '#fbbc04', // Google Yellow
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#202124',
      secondary: '#5f6368',
    },
  },
  typography: {
    fontFamily: '"Google Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 400,
      fontSize: '3.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 400,
      fontSize: '2.75rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 500,
      fontSize: '2.25rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.75rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          padding: '12px 32px',
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.12), 0 6px 20px rgba(0,0,0,0.15)',
          },
          transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        },
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#202124',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: {
              style: {
                background: '#34a853',
              },
            },
            error: {
              style: {
                background: '#ea4335',
              },
            },
          }}
        />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
