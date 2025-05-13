import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ReportGenerator from "../components/ReportGenerator";
import ReportViewer from "../components/ReportViewer";
import Header from "../components/Header";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [generatedReport, setGeneratedReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateReport = (report) => {
    setGeneratedReport(report);
    setIsLoading(false);
  };

  return (
    <div className="dashboard-container">
      <Header user={currentUser} onLogout={logout} />

      <div className="dashboard-content">
        <h1>Medical Report Generator</h1>
        <p>Upload medical images to generate detailed diagnostic reports.</p>

        <div className="dashboard-panels">
          <div className="generator-panel">
            <ReportGenerator
              onReportGenerated={handleGenerateReport}
              setIsLoading={setIsLoading}
            />
          </div>

          <div className="viewer-panel">
            <ReportViewer report={generatedReport} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
