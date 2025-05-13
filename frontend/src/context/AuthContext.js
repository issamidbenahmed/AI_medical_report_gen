import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "../config/axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      checkTokenValidity(token);
    } else {
      setLoading(false);
    }
  }, []);

  const checkTokenValidity = async (token) => {
    try {
      const response = await axios.post(
        "/api/auth/verify-token/",
        {},
        { headers: { Authorization: `Token ${token}` } }
      );

      if (response.data.valid) {
        setCurrentUser(response.data.user);
      } else {
        localStorage.removeItem("authToken");
      }
    } catch (error) {
      localStorage.removeItem("authToken");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login/", {
        email,
        password,
      });
      localStorage.setItem("authToken", response.data.token);
      setCurrentUser(response.data.user);
      setError("");
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Login failed";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const signup = async (userData) => {
    try {
      const response = await axios.post("/api/auth/register/", userData);
      localStorage.setItem("authToken", response.data.token);
      setCurrentUser(response.data.user);
      setError("");
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw error;
      } else {
        const errorMsg = "Une erreur est survenue lors de l'inscription";
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    }
  };

  const googleAuth = async (tokenId) => {
    try {
      const response = await axios.post("/api/auth/google/", {
        token_id: tokenId,
      });
      
      // Vérifier si l'email est vérifié
      if (response.data.hasOwnProperty('email_verified') && !response.data.email_verified) {
        // Email non vérifié, afficher le message
        setError("");
        return {
          success: false,
          message: response.data.message || "Veuillez vérifier votre email avant de vous connecter."
        };
      }
      
      // Email vérifié, procéder à la connexion
      localStorage.setItem("authToken", response.data.token);
      setCurrentUser(response.data.user);
      setError("");
      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Google authentication failed";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const resetPassword = async (email) => {
    try {
      await axios.post("/api/auth/request-password-reset/", { email });
      setError("");
      return true;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "La demande de réinitialisation du mot de passe a échoué";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const confirmPasswordReset = async (token, newPassword, confirmPassword) => {
    try {
      const response = await axios.post(`/api/auth/reset-password/${token}/`, {
        new_password: newPassword,
        confirm_password: confirmPassword,
        token: token,
      });
      setError("");
      return response.data;
    } catch (error) {
      console.log("Reset password error:", error.response?.data);
      if (error.response?.data) {
        throw error;
      } else {
        const errorMsg = "La réinitialisation du mot de passe a échoué";
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    signup,
    googleAuth,
    resetPassword,
    confirmPasswordReset,
    logout,
    error,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
