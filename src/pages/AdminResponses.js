import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import Papa from 'papaparse';

export default function AdminResponses() {
  const { id } = useParams();
  const [responses, setResponses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/survey/${id}/responses`)
      .then((res) => {
        setResponses(res.data.responses || []);
        setQuestions(res.data.questions || []);
        setLoading(false);
      })
      .catch(() => {
        alert('Failed to fetch responses');
        setLoading(false);
      });
  }, [id]);

  const exportToCSV = () => {
    if (!responses.length) return alert('No data to export');

    const csvData = responses.map((resp) => {
      const row = {
        Name: resp.userId?.name || 'N/A',
        Email: resp.userId?.email || 'N/A',
      };
      questions.forEach((question, i) => {
        row[question] = resp.answers[i] || 'No Answer';
      });
      return row;
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'survey_responses.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-6 text-center text-gray-500 text-lg">Loading responses...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">📊 Submitted Survey Responses</h2>
        <Link to="/admin" className="text-blue-600 font-medium hover:underline">
          ← Back to Admin Panel
        </Link>
      </div>

      {/* Export Button */}
      {responses.length > 0 && (
        <div className="mb-4 text-right">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded shadow"
          >
            ⬇ Export to CSV
          </button>
        </div>
      )}

      {/* No Data */}
      {responses.length === 0 ? (
        <p className="text-gray-600 text-center">No responses submitted yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border bg-white">
          <table className="min-w-full table-auto text-sm text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-gray-700 font-semibold">Employee</th>
                <th className="px-6 py-3 text-gray-700 font-semibold">Email</th>
                <th className="px-6 py-3 text-gray-700 font-semibold">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((resp, i) => (
                <tr key={i} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-800">{resp.userId?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-700">{resp.userId?.email || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-700">
                    <ul className="list-disc ml-5 space-y-1">
                      {questions.map((q, idx) => (
                        <li key={idx}>
                          <strong className="text-gray-800">{q}:</strong>{' '}
                          <span className="text-gray-600">{resp.answers[idx] || 'No Answer'}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
