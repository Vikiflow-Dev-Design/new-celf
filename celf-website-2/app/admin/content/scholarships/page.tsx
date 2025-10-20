'use client';

import React from 'react';
import { AdminLayout } from '@/src/components/admin/admin-layout';
import { Card } from '@/src/components/ui/card';

function ScholarshipManagement() {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-text-secondary">Scholarship management coming soon</p>
        </div>
      </Card>
    </div>
  );
}

export default function AdminContentScholarships() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">Scholarships</h2>
        </div>
        <ScholarshipManagement />
      </div>
    </AdminLayout>
  );
}