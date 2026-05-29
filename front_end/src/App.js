import React, { useState, useEffect } from 'react';
import './App.css';
import LandingPage from './components/Landing/LandingPage';
import PrivacyPage from './components/Landing/PrivacyPage';
import LoginPage from './components/LoginPage';
import AccountantDashboard from './components/AccountantDashboard';
import WorkshopManagerDashboard from './components/Manager/WorkshopManagerDashboard';
import MechanicDashboard from './components/Mechanic/MechanicDashboard';
import { ThemeProvider } from './context/ThemeContext';
import { normalizeUser } from './utils/authLogin';
import { authAPI } from './services/api';

/**
 * Main App Component
 * Entry point for the mechanical workshop management system
 * Manages landing page and authenticated dashboard
 */
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  /** 'home' | 'login' | 'privacy' — écran avant authentification */
  const [authScreen, setAuthScreen] = useState('home');

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#privacy') {
        setAuthScreen('privacy');
      } else if (!isAuthenticated) {
        setAuthScreen('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated]);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const userData = normalizeUser(JSON.parse(savedUser));
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    const normalized = normalizeUser(userData);
    setUser(normalized);
    setIsAuthenticated(true);
    setAuthScreen('home');
    localStorage.setItem('currentUser', JSON.stringify(normalized));
  };

  const handleLogout = () => {
    authAPI.logout().catch(() => {});
    setUser(null);
    setIsAuthenticated(false);
    setAuthScreen('home');
    localStorage.removeItem('currentUser');
  };

  const renderDashboard = () => {
    const role = user.role;
    if (role === 'comptable' || role === 'accountant') {
      return <AccountantDashboard user={user} onLogout={handleLogout} />;
    }
    if (role === 'responsable' || role === 'manager' || role === 'admin') {
      return <WorkshopManagerDashboard user={user} onLogout={handleLogout} />;
    }
    if (role === 'mecanicien') {
      return <MechanicDashboard user={user} onLogout={handleLogout} />;
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-8 gap-6">
        <p className="text-center max-w-md">
          Aucun tableau de bord pour le rôle « {role} ». Connectez-vous avec un compte responsable, comptable ou mécanicien.
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-white text-black font-semibold"
        >
          Déconnexion
        </button>
      </div>
    );
  };

  return (
    <ThemeProvider>
      <div className="App">
        {isAuthenticated && user ? (
          renderDashboard()
        ) : authScreen === 'login' ? (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onBackToHome={() => setAuthScreen('home')}
          />
        ) : authScreen === 'privacy' ? (
          <PrivacyPage
            onBack={() => {
              window.location.hash = '';
              setAuthScreen('home');
            }}
          />
        ) : (
          <LandingPage onGoToLogin={() => setAuthScreen('login')} />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
