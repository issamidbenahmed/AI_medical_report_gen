import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Forms.css";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (formData.username.length < 3) {
      newErrors.username =
        "Le nom d'utilisateur doit contenir au moins 3 caractères";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Veuillez entrer une adresse email valide";
    }

    // Password validation
    if (formData.password.length < 8) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await signup({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      // Afficher le message de succès au lieu de naviguer vers le dashboard
      setSuccessMessage(
        response.message ||
          "Un email de confirmation a été envoyé à votre adresse email."
      );

      // Rediriger vers la page de login après 5 secondes
      setTimeout(() => {
        navigate("/login", {
          state: {
            message:
              "Veuillez vérifier votre email pour confirmer votre compte avant de vous connecter.",
          },
        });
      }, 5000);
    } catch (error) {
      console.log("Error details:", error.response?.data);
      if (error.response?.data) {
        const backendErrors = {};
        Object.keys(error.response.data).forEach((key) => {
          if (Array.isArray(error.response.data[key])) {
            backendErrors[key] = error.response.data[key][0];
          } else if (typeof error.response.data[key] === "object") {
            backendErrors[key] = Object.values(error.response.data[key])[0];
          } else {
            backendErrors[key] = error.response.data[key];
          }
        });
        setErrors(backendErrors);
      } else {
        setErrors({
          general:
            "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Créer un compte</h2>
      {successMessage && (
        <div className="success-message">
          {successMessage}
          <p>Vous allez être redirigé vers la page de connexion...</p>
        </div>
      )}
      {errors.general && <div className="error-message">{errors.general}</div>}

      <div className="form-group">
        <label htmlFor="username">Nom d'utilisateur</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          minLength="3"
          maxLength="150"
          className={errors.username ? "error" : ""}
        />
        {errors.username && (
          <div className="error-message">{errors.username}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className={errors.email ? "error" : ""}
        />
        {errors.email && <div className="error-message">{errors.email}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="password">Mot de passe</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength="8"
          className={errors.password ? "error" : ""}
        />
        {errors.password && (
          <div className="error-message">{errors.password}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className={errors.confirmPassword ? "error" : ""}
        />
        {errors.confirmPassword && (
          <div className="error-message">{errors.confirmPassword}</div>
        )}
      </div>

      <button type="submit" className="primary-button" disabled={isLoading}>
        {isLoading ? "Création du compte..." : "S'inscrire"}
      </button>
    </form>
  );
};

export default SignupForm;
