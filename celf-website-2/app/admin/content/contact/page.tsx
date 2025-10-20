'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/src/components/admin/admin-layout';
import { Card } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { adminApi, ContactSubmission } from '@/src/lib/admin-api';
import { RefreshCw, Eye, Trash2 } from 'lucide-react';

interface ContactFormsProps {
  loading: boolean;
}

function ContactForms({ loading }: ContactFormsProps) {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  const fetchSubmissions = async () => {
    try {
      const response = await adminApi.getContactSubmissions({ limit: 50 });
      if (response.success && response.data && (response.data as any).submissions) {
        setSubmissions((response.data as any).submissions);
      } else {
        setSubmissions([]);
      }
    } catch (err) {
      console.error('Failed to fetch contact submissions:', err);
      setSubmissions([]);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await adminApi.updateContactSubmissionStatus(id, status);
      fetchSubmissions();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this submission?')) {
      try {
        await adminApi.deleteContactSubmission(id);
        fetchSubmissions();
      } catch (err) {
        console.error('Failed to delete submission:', err);
      }
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Contact Form Submissions</h3>
        <Button onClick={fetchSubmissions} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submissions List */}
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id} className="p-4 bg-card border-accent hover:border-accent-hover hover:shadow-glow transition-default">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-text-primary">{submission.name}</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mb-1">{submission.email}</p>
                  <p className="text-sm font-medium text-text-primary mb-2">{submission.subject}</p>
                  <p className="text-sm text-text-secondary line-clamp-2">{submission.message}</p>
                  <p className="text-xs text-text-muted mt-2">
                    {new Date(submission.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col space-y-1 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(submission.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Submission Detail */}
        {selectedSubmission && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Submission Details</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedSubmission(null)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="text-sm text-gray-900">{selectedSubmission.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{selectedSubmission.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <p className="text-sm text-gray-900">{selectedSubmission.subject}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedSubmission.message}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="flex space-x-2 mt-2">
                  {['pending', 'in_progress', 'resolved', 'closed'].map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedSubmission.status === status ? 'default' : 'outline'}
                      onClick={() => handleStatusUpdate(selectedSubmission.id, status)}
                    >
                      {status.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Submitted</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedSubmission.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function AdminContentContact() {
  const [loading] = useState(false);
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">Contact Forms</h2>
        </div>
        <ContactForms loading={loading} />
      </div>
    </AdminLayout>
  );
}