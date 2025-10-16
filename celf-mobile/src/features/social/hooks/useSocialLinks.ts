/**
 * Social Links Hook
 * Manages fetching and transforming social links from backend
 */

import { useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';
import { BackendSocialLink, SocialPlatform } from '../types';

// Icon mapping for different platforms
const getIconForPlatform = (platform: string): string => {
  const iconMap: Record<string, string> = {
    facebook: 'logo-facebook',
    twitter: 'logo-twitter',
    instagram: 'logo-instagram',
    linkedin: 'logo-linkedin',
    youtube: 'logo-youtube',
    tiktok: 'musical-notes',
    discord: 'chatbubbles',
    telegram: 'paper-plane',
    whatsapp: 'logo-whatsapp',
    snapchat: 'camera',
    pinterest: 'logo-pinterest',
    reddit: 'logo-reddit',
  };
  
  return iconMap[platform.toLowerCase()] || 'link-outline';
};

// Color mapping for different platforms
const getColorForPlatform = (platform: string): string => {
  const colorMap: Record<string, string> = {
    facebook: '#1877F2',
    twitter: '#1DA1F2',
    instagram: '#E4405F',
    linkedin: '#0A66C2',
    youtube: '#FF0000',
    tiktok: '#000000',
    discord: '#5865F2',
    telegram: '#0088CC',
    whatsapp: '#25D366',
    snapchat: '#FFFC00',
    pinterest: '#BD081C',
    reddit: '#FF4500',
  };
  
  return colorMap[platform.toLowerCase()] || '#666666';
};

// Transform backend social link to frontend format
const transformSocialLink = (backendLink: BackendSocialLink): SocialPlatform => ({
  id: backendLink.platform.toLowerCase(),
  name: backendLink.displayName || backendLink.platform,
  icon: backendLink.icon || getIconForPlatform(backendLink.platform),
  color: getColorForPlatform(backendLink.platform),
  baseUrl: backendLink.url,
});

export const useSocialLinks = () => {
  const [socialLinks, setSocialLinks] = useState<SocialPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSocialLinks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getSocialLinks();
      
      if (response.success && response.data) {
        // Filter active links and sort by sortOrder
        const activeLinks = response.data
          .filter((link: BackendSocialLink) => link.isActive)
          .sort((a: BackendSocialLink, b: BackendSocialLink) => a.sortOrder - b.sortOrder);
        
        // Transform to frontend format
        const transformedLinks = activeLinks.map(transformSocialLink);
        setSocialLinks(transformedLinks);
      } else {
        throw new Error(response.message || 'Failed to fetch social links');
      }
    } catch (err) {
      console.error('Error fetching social links:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch social links');
      
      // Fallback to default social links if API fails
      setSocialLinks([
        {
          id: 'facebook',
          name: 'Facebook',
          icon: 'logo-facebook',
          color: '#1877F2',
          baseUrl: 'https://facebook.com/celf.official',
        },
        {
          id: 'twitter',
          name: 'Twitter',
          icon: 'logo-twitter',
          color: '#1DA1F2',
          baseUrl: 'https://twitter.com/celf_official',
        },
        {
          id: 'instagram',
          name: 'Instagram',
          icon: 'logo-instagram',
          color: '#E4405F',
          baseUrl: 'https://instagram.com/celf.official',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  return {
    socialLinks,
    loading,
    error,
    refetch: fetchSocialLinks,
  };
};