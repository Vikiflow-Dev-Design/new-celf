'use client';

import React from 'react';
import { AdminLayout } from '@/src/components/admin/admin-layout';
import { Card } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { adminApi } from '@/src/lib/admin-api';
import { RefreshCw, Eye } from 'lucide-react';

function MentorshipManagement() {
  const [applications, setApplications] = React.useState<any[]>([]);
  const [selectedApplication, setSelectedApplication] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [pagination, setPagination] = React.useState<{ page: number; limit: number; total: number; totalPages: number }>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [filters, setFilters] = React.useState<{ type: 'all' | 'mentor' | 'mentee'; status: 'all' | 'pending' | 'approved' | 'rejected' }>({
    type: 'all',
    status: 'all',
  });

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getMentorshipApplications({
        page,
        limit,
        type: filters.type !== 'all' ? filters.type : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
      });
      if (response.success && response.data) {
        const apps = (response.data as any).applications ?? (response.data as any).data ?? [];
        const meta = (response.data as any).pagination ?? { page, limit, total: apps.length, totalPages: Math.ceil(apps.length / limit) || 1 };
        setApplications(apps);
        setPagination(meta);
      } else {
        setApplications([]);
        setPagination({ page, limit, total: 0, totalPages: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch mentorship applications:', err);
      setApplications([]);
      setPagination({ page, limit, total: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      await adminApi.updateMentorshipApplicationStatus(id, status);
      await fetchApplications();
      if (selectedApplication && selectedApplication.id === id) {
        setSelectedApplication({ ...selectedApplication, status });
      }
    } catch (err) {
      console.error('Failed to update mentorship application status:', err);
    }
  };

  React.useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.type, filters.status, page, limit]);

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeClasses = (type: string) => {
    switch (type) {
      case 'mentor':
        return 'bg-purple-100 text-purple-800';
      case 'mentee':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const onPrev = () => { if (page > 1) setPage(page - 1); };
  const onNext = () => { if ((pagination?.page || page) < (pagination?.totalPages || 1)) setPage(page + 1); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Mentorship Applications</h3>
        <div className="flex items-center space-x-2">
          <select
            value={filters.type}
            onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, type: e.target.value as any })); }}
            className="text-sm bg-transparent border border-border-accent/30 rounded-md px-2 py-1 text-text-primary"
          >
            <option value="all">All Types</option>
            <option value="mentor">Mentor</option>
            <option value="mentee">Mentee</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, status: e.target.value as any })); }}
            className="text-sm bg-transparent border border-border-accent/30 rounded-md px-2 py-1 text-text-primary"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={limit}
            onChange={(e) => { setPage(1); setLimit(parseInt(e.target.value)); }}
            className="text-sm bg-transparent border border-border-accent/30 rounded-md px-2 py-1 text-text-primary"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
          <Button onClick={fetchApplications} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-text-muted">
        <div>
          Showing {(applications.length > 0) ? ((pagination.page - 1) * pagination.limit + 1) : 0}
          {' - '}
          {Math.min(pagination.page * pagination.limit, pagination.total)}
          {' of '}
          {pagination.total}
        </div>
        <div>Page {pagination.page} / {pagination.totalPages || 1}</div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading mentorship applications...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications List */}
          <div className="space-y-4">
            {applications.length === 0 ? (
              <Card className="p-6">
                <div className="text-center text-text-secondary">No applications found</div>
              </Card>
            ) : (
              applications.map((app: any) => (
                <Card key={app.id} className="p-4 bg-card border-accent hover:border-accent-hover hover:shadow-glow transition-default">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-text-primary">{app.firstName} {app.lastName}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeClasses(app.type)}`}>
                          {app.type}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusClasses(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mb-1">{app.email}</p>
                      {app.type === 'mentor' && app.expertise && Array.isArray(app.expertise) && (
                        <p className="text-xs text-text-muted">Expertise: {app.expertise.join(', ')}</p>
                      )}
                      {app.type === 'mentee' && app.interests && Array.isArray(app.interests) && (
                        <p className="text-xs text-text-muted">Interests: {app.interests.join(', ')}</p>
                      )}
                      <p className="text-xs text-text-muted mt-2">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-1 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedApplication(app)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Application Detail */}
          {selectedApplication && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-text-primary">Application Details</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedApplication(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary">Name</label>
                    <p className="text-sm text-text-primary">{selectedApplication.firstName} {selectedApplication.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary">Email</label>
                    <p className="text-sm text-text-primary">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary">Type</label>
                    <p className="text-sm text-text-primary capitalize">{selectedApplication.type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary">Submitted</label>
                    <p className="text-sm text-text-primary">{new Date(selectedApplication.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary">Status</label>
                  <div className="flex space-x-2 mt-2">
                    {(['pending', 'approved', 'rejected'] as const).map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={selectedApplication.status === status ? 'default' : 'outline'}
                        onClick={() => handleStatusUpdate(selectedApplication.id, status)}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedApplication.type === 'mentor' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary">Education</label>
                      <p className="text-sm text-text-primary">{selectedApplication.education || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary">Experience</label>
                      <p className="text-sm text-text-primary whitespace-pre-wrap">{selectedApplication.experience || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary">Expertise</label>
                      <p className="text-sm text-text-primary">{Array.isArray(selectedApplication.expertise) ? selectedApplication.expertise.join(', ') : '—'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary">Motivation</label>
                      <p className="text-sm text-text-primary whitespace-pre-wrap">{selectedApplication.motivation || '—'}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary">LinkedIn</label>
                        <p className="text-sm text-text-primary break-all">{selectedApplication.linkedinProfile || '—'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary">Resume URL</label>
                        <p className="text-sm text-text-primary break-all">{selectedApplication.resumeUrl || '—'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedApplication.type === 'mentee' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary">Current Education</label>
                      <p className="text-sm text-text-primary">{selectedApplication.currentEducation || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary">Goals</label>
                      <p className="text-sm text-text-primary whitespace-pre-wrap">{selectedApplication.goals || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary">Interests</label>
                      <p className="text-sm text-text-primary">{Array.isArray(selectedApplication.interests) ? selectedApplication.interests.join(', ') : '—'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary">Challenges</label>
                      <p className="text-sm text-text-primary whitespace-pre-wrap">{selectedApplication.challenges || '—'}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-text-secondary">Availability</label>
                  <pre className="text-xs text-text-muted bg-background-secondary/40 border border-border-accent/20 rounded p-3 overflow-auto max-h-40">
                    {JSON.stringify(selectedApplication.availability || {}, null, 2)}
                  </pre>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
      <div className="flex items-center justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={page <= 1}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={onNext} disabled={(pagination.page || page) >= (pagination.totalPages || 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}

export default function AdminContentMentorship() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">Mentorship</h2>
        </div>
        <MentorshipManagement />
      </div>
    </AdminLayout>
  );
}