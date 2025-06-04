import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    jobDescription: '',
    projects: '',
    resume: null
  });
  const [result, setResult] = useState({
    loading: false,
    error: '',
    downloadUrl: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult({...result, loading: true, error: ''});
    
    const data = new FormData();
    data.append('jobDescription', formData.jobDescription);
    data.append('projects', formData.projects);
    data.append('resume', formData.resume);

    try {
      const response = await axios.post(
        'http://localhost:5000/process_resume', 
        data,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          responseType: 'blob'
        }
      );

      setResult({
        loading: false,
        downloadUrl: URL.createObjectURL(new Blob([response.data])),
        error: ''
      });
    } catch (err) {
      setResult({
        loading: false,
        error: err.response?.data?.error || 'Processing failed',
        downloadUrl: ''
      });
    }
  };

  return (
    <div className="app-container">
      <h1>ATS Resume Optimizer</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Job Description</label>
          <textarea
            value={formData.jobDescription}
            onChange={(e) => setFormData({...formData, jobDescription: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Your Projects (Start each with "Project Name:")</label>
          <textarea
            value={formData.projects}
            onChange={(e) => setFormData({...formData, projects: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Resume (Word Document)</label>
          <input
            type="file"
            accept=".docx"
            onChange={(e) => setFormData({...formData, resume: e.target.files[0]})}
            required
          />
        </div>

        <button type="submit" disabled={result.loading}>
          {result.loading ? 'Processing...' : 'Optimize Resume'}
        </button>
      </form>

      {result.error && <div className="error">{result.error}</div>}
      {result.downloadUrl && (
        <a href={result.downloadUrl} download="ats_optimized_resume.docx" className="download-btn">
          Download Your Resume
        </a>
      )}
    </div>
  );
}

export default App;
