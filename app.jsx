import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  });

  const handleSubmit = async () => {
    if (!file) {
      setError('Please upload a CSV file');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('csv_file', file);

    try {
      const response = await axios.post(
        'http://localhost:5000/analyze', 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 20000
        }
      );
      
      if (response.data?.stories) {
        setStories(response.data.stories);
      } else {
        throw new Error('Invalid server response');
      }
    } catch (err) {
      console.error('Analysis error:', {
        message: err.message,
        response: err.response?.data
      });
      setError(err.response?.data?.error || 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!stories.length) {
      setError('No results to download');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/download',
        { stories },
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lyon_analysis_${new Date().toISOString().slice(0,10)}.txt`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        link.remove();
      }, 100);
    } catch (err) {
      console.error('Download error:', err);
      setError(err.response?.data?.error || 'Download failed');
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>🏏 Nathan Lyon Dismissal Analyzer</h1>
        <p>Upload CSV to generate detailed analysis of Lyon's top victims</p>
      </header>

      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        <div className="dropzone-content">
          {isDragActive ? (
            <p>Drop CSV file here</p>
          ) : (
            <>
              <p>Drag & drop your CSV file</p>
              <small>or click to browse</small>
              <small>Required columns: Batsman, Dismissals, Average, Years</small>
            </>
          )}
        </div>
      </div>

      {file && (
        <div className="file-section">
          <div className="file-info">
            <span>{file.name}</span>
            <button 
              className="btn-clear"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
            >
              ×
            </button>
          </div>
          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Analyzing...
              </>
            ) : 'Analyze CSV'}
          </button>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      {stories.length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <h2>Analysis Results</h2>
            <button
              className="btn-download"
              onClick={handleDownload}
            >
              Download Full Report
            </button>
          </div>

          <div className="stories-list">
            {stories.map((story, index) => (
              <div key={index} className="story-card">
                <h3>{story.batsman}</h3>
                <div className="story-meta">
                  <span>Dismissals: {story.dismissals}</span>
                  <span>Average: {story.average}</span>
                </div>
                <div className="story-content">
                  {story.story.split('\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
