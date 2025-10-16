/**
 * Social Screen Data
 * Contains all static data for social media platforms and posts
 */

// Content types for filtering
export const contentTypes = [
  { id: 'all', label: 'All Posts', icon: 'grid-outline' },
  { id: 'videos', label: 'Videos', icon: 'play-circle-outline' },
  { id: 'articles', label: 'Articles', icon: 'document-text-outline' },
  { id: 'images', label: 'Images', icon: 'image-outline' },
];

// Social Media Platforms - Now fetched from backend via useSocialLinks hook
// This is kept as fallback data only
export const fallbackSocialPlatforms = [
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
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'logo-linkedin',
    color: '#0A66C2',
    baseUrl: 'https://linkedin.com/company/celf',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'logo-youtube',
    color: '#FF0000',
    baseUrl: 'https://youtube.com/@celf.official',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'musical-notes',
    color: '#000000',
    baseUrl: 'https://tiktok.com/@celf.official',
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: 'chatbubbles',
    color: '#5865F2',
    baseUrl: 'https://discord.gg/celf',
  },
];

// For backward compatibility - use fallback data
export const socialPlatforms = fallbackSocialPlatforms;

// Social Media Posts - Empty array to show empty state
// Posts should be fetched from backend or external APIs
export const socialPosts = [];
