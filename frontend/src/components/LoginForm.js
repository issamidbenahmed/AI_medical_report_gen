import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "../styles/Forms.css";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, googleAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const result = await googleAuth(response.tokenId);
      
      if (!result.success) {
        // Email non vérifié, afficher un message toast
        toast.info(result.message);
        // Optionnel : rediriger vers la page de connexion après un délai
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      } else {
        // Email vérifié, rediriger vers le dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Google authentication error:", error);
      toast.error("Échec de l'authentification Google");
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Welcome Back</h2>
      {errorMessage && <div className="error-message">{errorMessage}</div>}

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

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="primary-button" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
      
      {/* Ajouter un bouton pour Google Login qui utilise handleGoogleSuccess */}
      {/* Exemple: */}
      {/* <GoogleLogin
        clientId="YOUR_GOOGLE_CLIENT_ID"
        buttonText="Login with Google"
        onSuccess={handleGoogleSuccess}
        onFailure={(error) => console.error("Google login failed:", error)}
        cookiePolicy={'single_host_origin'}
      /> */}
    </form>
  );
};

export default LoginForm;
