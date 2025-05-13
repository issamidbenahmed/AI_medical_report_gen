import React, { useState } from "react";
import axios from "../config/axios";
import "../styles/ReportGenerator.css";

const ReportGenerator = ({ onReportGenerated, setIsLoading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [language, setLanguage] = useState("en");
  const [error, setError] = useState("");

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "zh", name: "Chinese" },
    { code: "ar", name: "Arabic" },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.includes("image/")) {
        setError("Please select an image file");
        setSelectedFile(null);
        setPreviewUrl("");
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Please select an image to analyze");
      return;
    }

    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("language", language);

    try {
      console.log("Sending request to generate report...");
      const response = await axios.post("/api/reports/generate/", formData, {
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
      });
      console.log("Report generated successfully:", response.data);
      onReportGenerated(response.data);
    } catch (error) {
      console.error("Error generating report:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to generate report";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="report-generator">
      <h2>Upload Medical Image</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="file-upload-container">
          <div
            className="file-upload-area"
            onClick={() => document.getElementById("image-upload").click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="image-preview" />
            ) : (
              <div className="upload-placeholder">
                <i className="upload-icon">📁</i>
                <p>Click to select or drag and drop an image</p>
              </div>
            )}
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="language">Report Language:</label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="generate-button"
          disabled={!selectedFile}
        >
          Generate Report
        </button>
      </form>
    </div>
  );
};

export default ReportGenerator;
