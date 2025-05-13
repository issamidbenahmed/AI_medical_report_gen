import React, { useState } from "react";
import "../styles/ReportViewer.css";

const ReportViewer = ({ report, isLoading }) => {
  const [exportFormat, setExportFormat] = useState("pdf");

  const handleExport = async () => {
    if (!report) return;

    try {
      // Use the base64 data directly from the report
      const base64Data = report[exportFormat];
      if (!base64Data) {
        console.error("No data available for the selected format");
        return;
      }

      // Convert base64 to blob
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: `application/${exportFormat}`,
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `medical-report.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="report-viewer">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Generating medical report...</p>
          <p className="loading-note">
            This may take a moment as we analyze the image and prepare a
            detailed report.
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="report-viewer empty-viewer">
        <div className="placeholder-content">
          <i className="report-icon">📋</i>
          <h3>No Report Generated</h3>
          <p>
            Upload a medical image and click "Generate Report" to view results
            here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="report-viewer">
      <div className="report-header">
        <h2>Medical Analysis Report</h2>
        <div className="export-controls">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
          >
            <option value="pdf">PDF Format</option>
            <option value="docx">Word Document</option>
          </select>
          <button onClick={handleExport} className="export-button">
            Download Report
          </button>
        </div>
      </div>

      <div className="report-content">
        <div className="report-section">
          <h3>Diagnosis Summary</h3>
          <p>{report.diagnosis || "No diagnosis available"}</p>
        </div>

        <div className="report-section">
          <h3>Analysis Details</h3>
          <div className="accuracy-meter">
            <div className="accuracy-label">
              Model Confidence: {(report.accuracy * 100).toFixed(1)}%
            </div>
            <div className="accuracy-bar">
              <div
                className="accuracy-fill"
                style={{ width: `${report.accuracy * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="condition-details">
            <p>{report.details || "No detailed analysis available"}</p>
          </div>
        </div>

        <div className="report-section">
          <h3>Treatment Recommendations</h3>
          {report.recommendations && report.recommendations.length > 0 ? (
            <ul className="recommendations-list">
              {report.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          ) : (
            <p>No specific recommendations available</p>
          )}
        </div>

        <div className="report-footer">
          <p>Report ID: {report.report_id}</p>
        </div>
      </div>
    </div>
  );
};

export default ReportViewer;
