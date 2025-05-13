import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "../styles/Forms.css";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { confirmPasswordReset } = useAuth();
  const navigate = useNavigate();
  const { token } = useParams();

  const validateForm = () => {
    const newErrors = {};

    if (password.length < 8) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await confirmPasswordReset(token, password, confirmPassword);
      toast.success("Votre mot de passe a été réinitialisé avec succès.");
      navigate("/login", {
        state: {
          message:
            "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.",
        },
      });
    } catch (error) {
      console.log("Reset password error details:", error.response?.data);

      // Gérer les erreurs de validation du mot de passe
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
        setErrors({ general: error.response.data.error });
      }
      // Si l'erreur est un tableau (comme dans votre exemple)
      else if (Array.isArray(error.response?.data)) {
        error.response.data.forEach((msg) => {
          toast.error(msg);
        });
        setErrors({ general: error.response.data.join(", ") });
      }
      // Pour les autres types d'erreurs
      else if (error.response?.data) {
        const backendErrors = {};
        Object.keys(error.response.data).forEach((key) => {
          if (Array.isArray(error.response.data[key])) {
            backendErrors[key] = error.response.data[key][0];
            // Afficher chaque erreur dans un toast
            error.response.data[key].forEach((msg) => {
              toast.error(`${key}: ${msg}`);
            });
          } else if (typeof error.response.data[key] === "object") {
            backendErrors[key] = Object.values(error.response.data[key])[0];
            toast.error(`${key}: ${backendErrors[key]}`);
          } else {
            backendErrors[key] = error.response.data[key];
            toast.error(`${key}: ${error.response.data[key]}`);
          }
        });
        setErrors(backendErrors);
      } else {
        const errorMessage =
          "Une erreur est survenue lors de la réinitialisation du mot de passe. Veuillez vérifier que le lien est valide et réessayer.";
        setErrors({ general: errorMessage });
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Réinitialiser votre mot de passe</h2>
        {errors.general && (
          <div className="error-message">{errors.general}</div>
        )}

        <div className="form-group">
          <label htmlFor="password">Nouveau mot de passe</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={errors.confirmPassword ? "error" : ""}
          />
          {errors.confirmPassword && (
            <div className="error-message">{errors.confirmPassword}</div>
          )}
        </div>

        <button type="submit" className="primary-button" disabled={isLoading}>
          {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
