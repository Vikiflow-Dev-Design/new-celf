'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AdminLayout } from '@/src/components/admin/admin-layout';
import { Card } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Switch } from '@/src/components/ui/switch';
import { adminApi } from '@/src/lib/admin-api';
import { ArrowLeft, Save, Loader2, RefreshCw } from 'lucide-react';

interface SocialLink {
  _id: string;
  platform: string;
  url: string;
  icon: string;
  displayName: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface SocialLinkForm {
  platform: string;
  url: string;
  icon: string;
  isActive: boolean;
}

export default function EditSocialLink() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socialLink, setSocialLink] = useState<SocialLink | null>(null);
  const [formData, setFormData] = useState({
    platform: '',
    url: '',
    icon: '',
    displayName: '',
    isActive: true,
    sortOrder: 0
  });

  const fetchSocialLink = async () => {
    try {
      setFetchLoading(true);
      setError(null);

      const response = await adminApi.getSocialLinkById(id);

      if (response.success && response.data) {
        setSocialLink(response.data);
        setFormData({
          platform: response.data.platform,
          url: response.data.url,
          icon: response.data.icon,
          displayName: response.data.displayName,
          isActive: response.data.isActive,
          sortOrder: response.data.sortOrder
        });
      } else {
        throw new Error(response.message || 'Failed to fetch social link');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch social link');
      console.error('Failed to fetch social link:', err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSocialLink();
    }
  }, [id]);

  const handleInputChange = (field: keyof SocialLinkForm, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.platform || !formData.url) {
      setError('Platform and URL are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await adminApi.updateSocialLink(id, formData);

      if (response.success) {
        router.push('/admin/social-links');
      } else {
        throw new Error(response.message || 'Failed to update social link');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update social link');
      console.error('Failed to update social link:', err);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading social link...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error && !socialLink) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary">Edit Social Link</h1>
              <p className="text-secondary">Social link not found</p>
            </div>
          </div>
          <Card className="bg-card border-accent p-6">
            <div className="text-center text-destructive">
              {error}
            </div>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">Edit Social Link</h1>
            <p className="text-secondary">Update social media link details</p>
          </div>
        </div>

        {/* Form */}
        <Card className="bg-card border-accent p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform *</Label>
                <Input
                  id="platform"
                  placeholder="e.g., Facebook, Twitter, Instagram"
                  value={formData.platform}
                  onChange={(e) => handleInputChange('platform', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  placeholder="e.g., Follow us on Facebook"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Input
                  id="icon"
                  placeholder="e.g., facebook, twitter, instagram"
                  value={formData.icon}
                  onChange={(e) => handleInputChange('icon', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  placeholder="0"
                  value={formData.sortOrder}
                  onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            {socialLink && (
              <div className="text-sm text-muted-foreground">
                <p>Created: {new Date(socialLink.createdAt).toLocaleString()}</p>
                <p>Last Updated: {new Date(socialLink.updatedAt).toLocaleString()}</p>
              </div>
            )}

            <div className="flex items-center gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Social Link
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
}