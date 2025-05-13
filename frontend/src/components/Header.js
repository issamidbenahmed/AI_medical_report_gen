import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";
import logo from "../assets/logo.svg";

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <img src={logo} alt="App logo" className="app-logo" />
        <h1>MedReport AI</h1>
      </div>

      <div className="header-right">
        {user && (
          <>
            <span className="user-name">Welcome {user.username}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
