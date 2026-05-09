import React, { useState } from 'react';
import { X, Lock, User, Loader } from 'lucide-react';
import { authAPI } from '../../services/api';
import './LoginModal.css';

export default function LoginModal({ onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ============================================================
  // HANDLE LOGIN - REAL BACKEND AUTHENTICATION
  // ============================================================
  // Uses Laravel Sanctum API to authenticate user
  // Credentials: comptable@gmail.com / 12345
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call backend API to authenticate user
      const response = await authAPI.login(email, password);

      // Success - call parent callback with user data
      onLoginSuccess({
        email: response.user.email,
        role: response.user.role,
        name: `${response.user.prenom} ${response.user.nom}`,
        token: response.token
      });
    } catch (err) {
      // Show error message from backend or generic message
      setError(err.message || 'Email ou mot de passe incorrect');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-modal-backdrop" onClick={onClose}>
      <div className="login-modal-container" onClick={(e) => e.stopPropagation()}>

        {/* Close Button */}
        <button className="modal-close" onClick={onClose}>
          <X className="close-icon" />
        </button>

        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">Connexion</h2>
          <p className="modal-subtitle">Accédez à votre tableau de bord comptable</p>
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
                placeholder="comptable@gmail.com"
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

        {/* Default Credentials Info */}
        <div className="demo-credentials">
          <p className="credentials-title">Identifiants comptable par défaut :</p>
          <ul className="credentials-list">
            <li><strong>Email :</strong> comptable@gmail.com</li>
            <li><strong>Mot de passe :</strong> 12345</li>
            <li style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
              ℹ️ Les autres rôles (Mécanicien, Responsable) sont la responsabilité d'autres développeurs
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
