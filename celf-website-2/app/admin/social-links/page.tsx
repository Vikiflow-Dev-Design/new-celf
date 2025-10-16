'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/src/components/admin/admin-layout';
import { Card } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Badge } from '@/src/components/ui/badge';
import { adminApi } from '@/src/lib/admin-api';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Link,
  ExternalLink
} from 'lucide-react';

interface SocialLink {
  _id: string;
  id?: string;
  platform: string;
  url: string;
  icon: string;
  displayName: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function SocialLinksManagement() {
  const router = useRouter();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSocialLinks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminApi.getAllSocialLinks();

      if (response.success && response.data) {
        setSocialLinks(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch social links');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch social links');
      console.error('Failed to fetch social links:', err);
      setSocialLinks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const filteredSocialLinks = socialLinks.filter(link => 
    link.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSocialLink = () => {
    router.push('/admin/social-links/create');
  };

  const handleEditSocialLink = (link: SocialLink) => {
    router.push(`/admin/social-links/edit/${link._id}`);
  };

  const handleDeleteSocialLink = async (socialLink: SocialLink) => {
    if (window.confirm('Are you sure you want to delete this social link?')) {
      try {
        await adminApi.deleteSocialLink(socialLink._id);
        fetchSocialLinks(); // Refresh the list
      } catch (error) {
        console.error('Error deleting social link:', error);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Social Links</h1>
            <p className="text-secondary">Manage social media links for the website</p>
          </div>
          <Button onClick={handleCreateSocialLink} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add New Link
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search social links..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="border-accent"
            onClick={fetchSocialLinks}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Social Links List */}
        <Card className="bg-card border-accent overflow-hidden">
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive text-center">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p>Loading social links...</p>
            </div>
          ) : filteredSocialLinks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchTerm ? 'No social links match your search' : 'No social links found'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-primary">Platform</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-primary">Display Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-primary">URL</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-primary">Icon</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-primary">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSocialLinks.map((link) => (
                    <tr key={link._id} className="border-t border-accent hover:bg-secondary/20">
                      <td className="px-4 py-3 text-sm">{link.platform}</td>
                      <td className="px-4 py-3 text-sm">{link.displayName}</td>
                      <td className="px-4 py-3 text-sm">
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-500 hover:underline"
                        >
                          {link.url.length > 30 ? `${link.url.substring(0, 30)}...` : link.url}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm">{link.icon}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={link.isActive ? "success" : "secondary"}>
                          {link.isActive ? (
                            <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                          ) : (
                            <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                          )}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSocialLink(link)}
                            className="h-8 px-2 text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSocialLink(link)}
                            className="h-8 px-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}