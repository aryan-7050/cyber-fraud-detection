import React, { useState, useEffect, createContext, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

// Lazy load components for better performance
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const TransactionForm = lazy(() => import('./components/TransactionForm'));
const FraudAnalytics = lazy(() => import('./components/FraudAnalytics'));
const TransactionHistory = lazy(() => import('./components/TransactionHistory'));
const SecuritySettings = lazy(() => import('./components/SecuritySettings'));
const AIDetection = lazy(() => import('./components/AIDetection'));
const PerformanceMonitor = lazy(() => import('./components/PerformanceMonitor'));
const FraudHeatmap = lazy(() => import('./components/FraudHeatmap'));

export const ThemeContext = createContext();
export const NotificationContext = createContext();

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
      cacheTime: 300000,
    },
  },
});

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  }}>
    <div style={{
      background: 'white',
      padding: '2rem',
      borderRadius: '20px',
      textAlign: 'center',
      maxWidth: '500px',
    }}>
      <h2>Something went wrong</h2>
      <pre style={{ color: 'red' }}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  </div>
);

// Loading Component
const LoadingScreen = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  }}>
    <div className="loading-spinner" />
  </div>
);

const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [notifications, setNotifications] = useState([]);
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#667eea',
        light: '#8b9eff',
        dark: '#4c6ef5',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#f56565',
        light: '#fc8181',
        dark: '#e53e3e',
        contrastText: '#ffffff',
      },
      success: {
        main: '#48bb78',
        light: '#68d391',
        dark: '#38a169',
      },
      warning: {
        main: '#ed8936',
        light: '#f6ad55',
        dark: '#dd6b20',
      },
      info: {
        main: '#4299e1',
        light: '#63b3ed',
        dark: '#3182ce',
      },
      background: {
        default: darkMode ? '#0f172a' : '#f7fafc',
        paper: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      },
    },
    typography: {
      fontFamily: '"Inter", "Poppins", "Segoe UI", sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 16,
    },
    shadows: [
      'none',
      '0px 2px 4px rgba(0,0,0,0.05)',
      '0px 4px 8px rgba(0,0,0,0.1)',
      '0px 8px 16px rgba(0,0,0,0.1)',
      '0px 12px 24px rgba(0,0,0,0.1)',
      '0px 16px 32px rgba(0,0,0,0.1)',
      '0px 20px 40px rgba(0,0,0,0.1)',
      ...Array(18).fill('none'),
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            padding: '10px 24px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          },
          contained: {
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '24px',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50));
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Check token expiry
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  };

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" replace />;
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <QueryClientProvider client={queryClient}>
        <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
          <NotificationContext.Provider value={{ notifications, addNotification }}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Router>
                <Suspense fallback={<LoadingScreen />}>
                  <AnimatePresence mode="wait">
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/dashboard" element={
                        <ProtectedRoute><Dashboard /></ProtectedRoute>
                      } />
                      <Route path="/transaction" element={
                        <ProtectedRoute><TransactionForm /></ProtectedRoute>
                      } />
                      <Route path="/analytics" element={
                        <ProtectedRoute><FraudAnalytics /></ProtectedRoute>
                      } />
                      <Route path="/history" element={
                        <ProtectedRoute><TransactionHistory /></ProtectedRoute>
                      } />
                      <Route path="/security" element={
                        <ProtectedRoute><SecuritySettings /></ProtectedRoute>
                      } />
                      <Route path="/ai-detection" element={
                        <ProtectedRoute><AIDetection /></ProtectedRoute>
                      } />
                      <Route path="/performance" element={
                        <ProtectedRoute><PerformanceMonitor /></ProtectedRoute>
                      } />
                      <Route path="/heatmap" element={
                        <ProtectedRoute><FraudHeatmap /></ProtectedRoute>
                      } />
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </AnimatePresence>
                </Suspense>
              </Router>
              <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={darkMode ? 'dark' : 'light'}
                style={{ zIndex: 9999 }}
              />
              {!onlineStatus && (
                <div style={{
                  position: 'fixed',
                  bottom: 20,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#f56565',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  zIndex: 10000,
                }}>
                  You are offline. Some features may be unavailable.
                </div>
              )}
            </ThemeProvider>
          </NotificationContext.Provider>
        </ThemeContext.Provider>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;