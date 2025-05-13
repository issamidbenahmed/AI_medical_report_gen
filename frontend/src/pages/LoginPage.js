import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import doctorAnimation from "../assets/original-doctor-animation.gif";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const [activeForm, setActiveForm] = useState("login");
  const { googleAuth } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleAuth(credentialResponse.credential);
      navigate("/dashboard");
    } catch (error) {
      console.error("Google auth failed:", error);
    }
  };

  const handleGoogleFailure = () => {
    console.error("Google login failed");
  };

  return (
    <div className="login-container">
      <div className="login-animation">
        <img src={doctorAnimation} alt="Medical animation" />
      </div>
      <div className="login-form-container">
        <div className="form-switch-container">
          <button
            className={`form-switch ${activeForm === "login" ? "active" : ""}`}
            onClick={() => setActiveForm("login")}
          >
            Login
          </button>
          <button
            className={`form-switch ${activeForm === "signup" ? "active" : ""}`}
            onClick={() => setActiveForm("signup")}
          >
            Sign Up
          </button>
        </div>

        {activeForm === "login" && (
          <>
            <LoginForm />
            <div className="google-auth-container">
              <p>OR</p>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
                width="280px"
              />
            </div>
            <button
              className="text-button"
              onClick={() => setActiveForm("forgot-password")}
            >
              Forgot Password?
            </button>
          </>
        )}

        {activeForm === "signup" && (
          <>
            <SignupForm />
            <div className="google-auth-container">
              <p>OR</p>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
                width="280px"
              />
            </div>
          </>
        )}

        {activeForm === "forgot-password" && (
          <>
            <ForgotPasswordForm onBack={() => setActiveForm("login")} />
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
