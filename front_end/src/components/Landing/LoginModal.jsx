import React, { useState } from 'react';
import { X, Lock, User, Loader } from 'lucide-react';
import './LoginModal.css';

export default function LoginModal({ onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Demo credentials
  const DEMO_USERS = {
    'accountant@atelier.com': { password: 'password123', role: 'accountant' },
    'manager@atelier.com': { password: 'password123', role: 'manager' },
    'admin@atelier.com': { password: 'password123', role: 'admin' },
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const user = DEMO_USERS[email];

      if (!user || user.password !== password) {
        setError('Email ou mot de passe incorrect');
        setIsLoading(false);
        return;
      }

      // Success
      onLoginSuccess({
        email,
        role: user.role,
        name: email.split('@')[0],
      });
    }, 800);
  };

  return (
    <>
      <div className="login-modal-backdrop" onClick={onClose}></div>
      <div className="login-modal-container">
        {/* Close Button */}
        <button className="modal-close" onClick={onClose}>
          <X className="close-icon" />
        </button>

        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">Connexion</h2>
          <p className="modal-subtitle">Accédez à votre tableau de bord</p>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleLogin}>
          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">Adresse email</label>
            <div className="form-input-wrapper">
              <User className="input-icon" />
              <input
                type="email"
                className="form-input"
                placeholder="exemple@atelier.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <div className="form-input-wrapper">
              <Lock className="input-icon" />
              <input
                type="password"
                className="form-input"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message animate-shake">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="form-submit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader className="spinner" />
                <span>Connexion en cours...</span>
              </>
            ) : (
              <span>Se connecter</span>
            )}
          </button>
        </form>

        {/* Demo Credentials Info */}
        <div className="demo-credentials">
          <p className="credentials-title">Identifiants de démonstration :</p>
          <ul className="credentials-list">
            <li><strong>Comptable :</strong> accountant@atelier.com / password123</li>
            <li><strong>Gestionnaire :</strong> manager@atelier.com / password123</li>
            <li><strong>Admin :</strong> admin@atelier.com / password123</li>
          </ul>
        </div>

        {/* Temporary Buttons for UI Testing */}
        <div className="temp-buttons-section">
          <button className="temp-button" onClick={() => console.log('Temp Button 1 clicked')}>
            Btn Temp 1
          </button>
          <button className="temp-button" onClick={() => console.log('Temp Button 2 clicked')}>
            Btn Temp 2
          </button>
          <button className="temp-button" onClick={() => console.log('Temp Button 3 clicked')}>
            Btn Temp 3
          </button>
        </div>
      </div>
    </>
  );
}
