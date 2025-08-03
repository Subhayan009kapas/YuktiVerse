import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PDFHistory.css';

const PDFHistory = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/pdf/history');
      setDocuments(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
      alert('Failed to fetch PDF history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this PDF?')) return;

    try {
      await axios.delete(`/api/pdf/delete/${id}`);
      setDocuments((prev) => prev.filter((doc) => doc._id !== id));
      alert('PDF deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete PDF');
    }
  };

  if (loading) return <p className="pdf-history__loading">Loading history...</p>;

  return (
    <div className="pdf-history">
      <h2 className="pdf-history__title">Saved PDFs</h2>
      {documents.map((doc) => (
        <div key={doc._id} className="pdf-history__card">
          <h3>{doc.title}</h3>
          <p><strong>Summary:</strong> {doc.summary}</p>
          <p><strong>Uploaded:</strong> {new Date(doc.createdAt).toLocaleString()}</p>

          {doc.cloudinaryUrl && (
            <a href={doc.cloudinaryUrl} target="_blank" rel="noopener noreferrer">
              View PDF
            </a>
          )}

          {doc.mcqs.length > 0 && (
            <div className="pdf-history__mcqs">
              <h4>MCQs:</h4>
              <ul>
                {doc.mcqs.map((q, i) => (
                  <li key={i}>
                    <strong>Q{i + 1}:</strong> {q.question}
                    <ul>
                      {q.options.map((opt, idx) => (
                        <li key={idx}>{String.fromCharCode(65 + idx)}. {opt}</li>
                      ))}
                    </ul>
                    <strong>Answer:</strong> {q.answer}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            className="pdf-history__delete-btn"
            onClick={() => handleDelete(doc._id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default PDFHistory;
