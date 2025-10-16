/**
 * Social Screen Types
 * Type definitions for social media functionality
 */

export interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  baseUrl: string;
}

// Backend social link interface
export interface BackendSocialLink {
  _id: string;
  platform: string;
  url: string;
  icon: string;
  displayName: string;
  isActive: boolean;
  sortOrder: number;
}

export interface PostEngagement {
  likes: number;
  shares: number;
  comments: number;
}

// YouTube video specific data structure
export interface YouTubeVideoData {
  videoId: string;
  channelId: string;
  channelTitle: string;
  thumbnail: {
    default?: string;
    medium?: string;
    high?: string;
    standard?: string;
    maxres?: string;
  };
  duration?: string;
  statistics: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
  };
  tags: string[];
  metadata: {
    categoryId?: string;
    defaultLanguage?: string;
    defaultAudioLanguage?: string;
  };
}

// Instagram post specific data structure
export interface InstagramPostData {
  mediaId: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  mediaUrl: string;
  thumbnailUrl?: string;
  username: string;
  statistics: {
    likeCount: number;
    commentCount: number;
  };
  metadata: any;
}

export interface SocialPost {
  id: string; // Changed from number to string to accommodate MongoDB ObjectIds
  title: string;
  description: string;
  thumbnail: string;
  platforms: string[];
  engagement: PostEngagement;
  time: string;
  contentType: 'all' | 'videos' | 'shorts' | 'articles' | 'images' | 'youtube';
  postUrls: Record<string, string>;
  url: string; // Direct URL to the content
  publishedAt: string; // ISO date string
  platform: string; // Source platform (e.g., 'youtube', 'twitter', etc.)
  type: string; // Content type (e.g., 'video', 'post', 'article')
  
  // YouTube specific data (optional, only present for YouTube posts)
  youtubeData?: YouTubeVideoData;
  
  // Instagram specific data (optional, only present for Instagram posts)
  instagramData?: InstagramPostData;
}

export interface ContentType {
  id: string;
  label: string;
  icon: string;
}

export type ContentTypeId = 'all' | 'videos' | 'shorts' | 'articles' | 'images';
