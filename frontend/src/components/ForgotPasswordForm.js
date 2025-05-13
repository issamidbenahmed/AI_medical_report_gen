import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Forms.css";

const ForgotPasswordForm = ({ onBack }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      await resetPassword(email);
      setMessage("Password reset link sent to your email.");
      setIsError(false);
    } catch (error) {
      setMessage(error.message);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Reset Password</h2>
      {message && (
        <div
          className={`message ${isError ? "error-message" : "success-message"}`}
        >
          {message}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="primary-button" disabled={isLoading}>
        {isLoading ? "Sending..." : "Reset Password"}
      </button>

      <button type="button" className="text-button" onClick={onBack}>
        Back to Login
      </button>
    </form>
  );
};

export default ForgotPasswordForm;
