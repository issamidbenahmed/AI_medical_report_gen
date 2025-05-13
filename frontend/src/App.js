import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useParams,
  useNavigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import "./App.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import axios from "./config/axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Créez un composant pour la vérification d'email
const EmailVerificationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`/api/auth/verify-email/${token}/`);
        setMessage(response.data.message);
        setIsError(false);

        // Vérifier si c'est un utilisateur Google
        if (response.data.is_google_user) {
          // Stocker le token et rediriger vers le dashboard
          localStorage.setItem("authToken", response.data.token);
          // Rediriger vers le dashboard immédiatement
          setTimeout(() => navigate("/dashboard"), 1500);
        } else {
          // Pour les autres utilisateurs, rediriger vers la page de connexion après 3 secondes
          setTimeout(() => navigate("/login"), 3000);
        }
      } catch (error) {
        setMessage(
          error.response?.data?.error || "Erreur de vérification d'email"
        );
        setIsError(true);
      }
    };
    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="auth-container">
      <div className={`message-container ${isError ? "error" : "success"}`}>
        <h2>{isError ? "Échec de la vérification" : "Vérification réussie"}</h2>
        <p>{message}</p>
        {isError && (
          <button onClick={() => navigate("/login")} className="primary-button">
            Retour à la connexion
          </button>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <GoogleOAuthProvider clientId="362842294073-smr1q2movml2jqmisvsccca4qbvapcdg.apps.googleusercontent.com">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />
            {/* Ajoutez cette nouvelle route pour la vérification d'email */}
            <Route
              path="/verify-email/:token"
              element={<EmailVerificationPage />}
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
