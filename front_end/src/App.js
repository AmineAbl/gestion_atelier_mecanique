import React, { useState, useEffect } from 'react';
import './App.css';
import LandingPage from './components/Landing/LandingPage';
import AccountantDashboard from './components/AccountantDashboard';

/**
 * Main App Component
 * Entry point for the mechanical workshop management system
 * Manages landing page and authenticated dashboard
 */
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  return (
    <div className="App">
      {isAuthenticated && user ? (
        <AccountantDashboard user={user} onLogout={handleLogout} />
      ) : (
        <LandingPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
