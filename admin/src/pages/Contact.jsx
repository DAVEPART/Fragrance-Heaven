import React, { useState, useEffect } from 'react';
import { useAlert } from '../context/AlertContext';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { backendUrl } from '../App';

const Contact = () => {
  const alert = useAlert();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${backendUrl}/api/contact/all`);
        const data = await response.json();

        if (response.ok && data.success) {
          setSubmissions(data.submissions);
        } else {
          alert.error(data.message || 'Failed to fetch submissions!');
        }
      } catch (error) {
        console.error('Error:', error);
        alert.error('An error occurred while fetching the submissions.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (loading) {
    return (
      <Card title="Contact Submissions">
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }

  return (
    <Card title="Contact Submissions">
      {submissions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No contact submissions yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-primary-600 text-white">
                <th className="py-3 px-4 text-left font-semibold rounded-tl-lg">Name</th>
                <th className="py-3 px-4 text-left font-semibold">Email</th>
                <th className="py-3 px-4 text-left font-semibold">Subject</th>
                <th className="py-3 px-4 text-left font-semibold rounded-tr-lg">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{submission.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{submission.email}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{submission.subject}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{submission.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default Contact;
