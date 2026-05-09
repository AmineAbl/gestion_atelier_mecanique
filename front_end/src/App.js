import React, { useState, useEffect } from 'react';
import './styles/global.css';
import './App.css';
import LandingPage from './components/Landing/LandingPage';
import AccountantDashboard from './components/AccountantDashboard';
import { ThemeProvider } from './context/ThemeContext';
import { getStoredUser } from './services/api';

/**
 * ============================================================
 * MAIN APP COMPONENT
 * ============================================================
 * Entry point for the mechanical workshop management system
 * Manages landing page and authenticated dashboard
 * 
 * Features:
 * - Persistent authentication with localStorage
 * - Token-based API authentication (Laravel Sanctum)
 * - Theme provider wrapper for dark/light mode support
 * - Conditional rendering based on auth state
 */
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check for stored auth token (set by API service on login)
        const authToken = localStorage.getItem('auth_token');
        const storedUser = getStoredUser();

        if (authToken && storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Clear invalid credentials
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Handle successful login
   * @param {object} userData - User object from API response
   */
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    // Token is already stored by authAPI.login()
  };

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '10px'
          }}>
            Chargement...
          </div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="App">
        {isAuthenticated && user ? (
          <AccountantDashboard user={user} onLogout={handleLogout} />
        ) : (
          <LandingPage onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
