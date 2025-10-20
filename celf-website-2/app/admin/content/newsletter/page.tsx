'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/src/components/admin/admin-layout';
import { Card } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { adminApi } from '@/src/lib/admin-api';
import { RefreshCw, Mail } from 'lucide-react';

function NewsletterManagement() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getNewsletterSubscriptions({ limit: 100 });
      if (response.success && response.data && (response.data as any).subscriptions) {
        setSubscriptions((response.data as any).subscriptions);
      } else {
        setSubscriptions([]);
      }
    } catch (err) {
      console.error('Failed to fetch newsletter subscriptions:', err);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading newsletter subscriptions...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Newsletter Subscriptions</h3>
        <Button onClick={fetchSubscriptions} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card className="p-6">
        <div className="text-center py-8">
          <Mail className="h-12 w-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary">Newsletter management coming soon</p>
          <p className="text-sm text-text-muted mt-2">
            Total subscriptions: {subscriptions.length}
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function AdminContentNewsletter() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">Newsletter</h2>
        </div>
        <NewsletterManagement />
      </div>
    </AdminLayout>
  );
}