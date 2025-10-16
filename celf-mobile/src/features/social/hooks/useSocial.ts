/**
 * Social Screen Hook
 * Custom hook for social media functionality
 */

import { useState, useEffect } from 'react';
import { socialPosts } from '../data';
import { filterPostsByContentType, handleSocialPress, openPlatformUrl } from '../utils';
import { apiService } from '@/services/apiService';
import type { ContentTypeId, SocialPost, SocialPlatform } from '../types';

/**
 * Parse ISO 8601 duration (PT4M13S) to seconds
 * @param duration - ISO 8601 duration string
 * @returns duration in seconds
 */
const parseDurationToSeconds = (duration: string): number => {
  if (!duration) return 0;
  
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  
  return hours * 3600 + minutes * 60 + seconds;
};

export const useSocial = () => {
  // Content type filter state
  const [activeContentType, setActiveContentType] = useState<ContentTypeId>('all');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SocialPost[]>([]);
  const [searchResultInfo, setSearchResultInfo] = useState<{
    query: string;
    hasResults: boolean;
    showingFallback: boolean;
  } | null>(null);
  
  // YouTube videos state
  const [youtubeVideos, setYoutubeVideos] = useState<SocialPost[]>([]);
  const [isLoadingYoutube, setIsLoadingYoutube] = useState(false);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);

  // Instagram posts state
  const [instagramPosts, setInstagramPosts] = useState<SocialPost[]>([]);
  const [isLoadingInstagram, setIsLoadingInstagram] = useState(false);
  const [instagramError, setInstagramError] = useState<string | null>(null);

  // Combined posts (static + YouTube)
  const [allPosts, setAllPosts] = useState<SocialPost[]>(socialPosts);

  // Fetch YouTube videos with optional search
  const fetchYouTubeVideos = async (searchQuery?: string) => {
    try {
      setIsLoadingYoutube(true);
      setYoutubeError(null);
      
      console.log('Fetching YouTube videos with search:', searchQuery); // Debug log
      
      let response;
      let searchResults: any[] = [];
      let fallbackToDefault = false;
      
      if (searchQuery?.trim()) {
        // Use dedicated search endpoint for search queries
        response = await apiService.searchYouTubeVideos(searchQuery.trim(), 10);
        
        // If search returns empty results, fallback to default videos
        if (response.success && (!response.data || response.data.length === 0)) {
          console.log('Search returned no results, falling back to default videos');
          fallbackToDefault = true;
          response = await apiService.getYouTubeVideos({ limit: 10 });
        }
      } else {
        // Use regular videos endpoint for no search
        response = await apiService.getYouTubeVideos({ limit: 10 });
      }
      
      console.log('YouTube API response:', response); // Debug log
      
      if (response.success && response.data) {
        // Transform YouTube API response to SocialPost format
        const transformedVideos: SocialPost[] = response.data.map((video) => ({
          id: video.id,
          title: video.title,
          description: video.description,
          thumbnail: video.thumbnail.high || video.thumbnail.medium || video.thumbnail.default || '',
          platforms: ['youtube'],
          engagement: {
            likes: video.engagement.likes,
            shares: 0, // YouTube API doesn't provide shares
            comments: video.engagement.comments,
          },
          time: formatTimeAgo(video.publishedAt),
          contentType: 'videos' as const,
          postUrls: {
            youtube: video.url,
          },
          url: video.url,
          publishedAt: video.publishedAt,
          platform: 'youtube',
          type: 'video',
          youtubeData: {
            videoId: video.metadata.videoId,
            channelId: video.metadata.channelId,
            channelTitle: video.channelTitle,
            thumbnail: video.thumbnail,
            duration: video.duration,
            statistics: video.statistics,
            tags: video.tags,
            metadata: {
              categoryId: video.metadata.categoryId,
              defaultLanguage: video.metadata.defaultLanguage,
              defaultAudioLanguage: video.metadata.defaultAudioLanguage,
            },
          },
        }));

        console.log('Transformed YouTube videos:', transformedVideos.length); // Debug log

        setYoutubeVideos(transformedVideos);
        
        // Store search result info for UI display
        if (searchQuery?.trim() && fallbackToDefault) {
          // Mark that we're showing fallback results
          setSearchResultInfo({
            query: searchQuery.trim(),
            hasResults: false,
            showingFallback: true
          });
        } else if (searchQuery?.trim()) {
          // Mark that we have search results
          setSearchResultInfo({
            query: searchQuery.trim(),
            hasResults: transformedVideos.length > 0,
            showingFallback: false
          });
        } else {
          // Clear search result info when not searching
          setSearchResultInfo(null);
        }
        
        // Always update allPosts with current YouTube results
        setAllPosts([...transformedVideos, ...instagramPosts, ...socialPosts]);
      }
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      setYoutubeError('Failed to load YouTube videos');
    } finally {
      setIsLoadingYoutube(false);
    }
  };

  // Fetch Instagram posts - DISABLED FOR NOW
  const fetchInstagramPosts = async () => {
    // Instagram functionality is temporarily disabled
    // Set loading to false and clear any errors
    setIsLoadingInstagram(false);
    setInstagramError(null);
    setInstagramPosts([]);
    
    console.log('Instagram functionality is disabled - focusing on YouTube content only');
    return;
  };

  // Helper function to format time ago
  const formatTimeAgo = (publishedAt: string): string => {
    const now = new Date();
    const published = new Date(publishedAt);
    const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  };

  // Load YouTube videos on component mount (Instagram disabled)
  useEffect(() => {
    fetchYouTubeVideos();
    // fetchInstagramPosts(); // Disabled - focusing on YouTube only
  }, []);

  // Search functionality with relevance ranking
  const calculateRelevanceScore = (post: SocialPost, query: string): number => {
    if (!query.trim()) return 0;
    
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    let score = 0;
    
    // Title relevance (highest weight)
    const titleLower = post.title.toLowerCase();
    searchTerms.forEach(term => {
      if (titleLower.includes(term)) {
        // Exact match gets higher score
        if (titleLower === term) score += 100;
        // Title starts with term gets high score
        else if (titleLower.startsWith(term)) score += 80;
        // Title contains term gets medium score
        else score += 50;
      }
    });
    
    // Description relevance (medium weight)
    const descriptionLower = post.description.toLowerCase();
    searchTerms.forEach(term => {
      if (descriptionLower.includes(term)) {
        score += 30;
      }
    });
    
    // Content type relevance (low weight)
    if (post.contentType.toLowerCase().includes(query.toLowerCase())) {
      score += 20;
    }
    
    // Platform relevance (low weight)
    post.platforms.forEach(platform => {
      if (platform.toLowerCase().includes(query.toLowerCase())) {
        score += 15;
      }
    });
    
    // YouTube specific data relevance
    if (post.youtubeData) {
      const channelTitle = post.youtubeData.channelTitle?.toLowerCase() || '';
      const tags = post.youtubeData.tags || [];
      
      searchTerms.forEach(term => {
        if (channelTitle.includes(term)) score += 25;
        tags.forEach(tag => {
          if (tag.toLowerCase().includes(term)) score += 10;
        });
      });
    }

    // Instagram specific data relevance
    if (post.instagramData) {
      const username = post.instagramData.username?.toLowerCase() || '';
      
      searchTerms.forEach(term => {
        if (username.includes(term)) score += 25;
      });
    }
    
    // Engagement boost (popular content gets slight boost)
    const engagementBoost = Math.min(
      (post.engagement.likes + post.engagement.comments + post.engagement.shares) / 1000,
      10
    );
    score += engagementBoost;
    
    return score;
  };

  const performSearch = (query: string, posts: SocialPost[]): SocialPost[] => {
    if (!query.trim()) return posts;
    
    // Calculate relevance scores and filter
    const scoredPosts = posts
      .map(post => ({
        post,
        score: calculateRelevanceScore(post, query)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.post);
    
    return scoredPosts;
  };

  // Update search results when query changes - now triggers backend search for YouTube
  useEffect(() => {
    console.log('Search effect triggered with query:', searchQuery); // Debug log
    
    if (searchQuery.trim()) {
      // For YouTube, trigger backend search
      fetchYouTubeVideos(searchQuery);
      
      // Instagram is disabled, so no need to search Instagram posts
      // For any other static posts, still filter locally
      const nonYoutubeResults = performSearch(searchQuery, [...socialPosts]); // Removed instagramPosts
      
      console.log('Local search results (non-YouTube):', nonYoutubeResults.length); // Debug log
      
      // Set search results to non-YouTube results (YouTube results handled via fetchYouTubeVideos)
      setSearchResults(nonYoutubeResults);
    } else {
      // No search query - fetch normal YouTube videos and clear search results
      fetchYouTubeVideos();
      setSearchResults([]);
    }
  }, [searchQuery]); // Removed instagramPosts dependency since Instagram is disabled

  // Filter posts based on active content type and search
  const getFilteredPosts = (): SocialPost[] => {
    // When searching, combine YouTube results (from allPosts after backend search) with local search results
    const postsToFilter = searchQuery.trim() 
      ? [...youtubeVideos, ...searchResults] // YouTube from backend search + locally filtered Instagram/static posts
      : allPosts; // Normal view - all posts
    return filterPostsByContentType(postsToFilter, activeContentType);
  };

  const filteredPosts = getFilteredPosts();

  // Handle search query change (for input display only)
  const handleSearchChange = (query: string) => {
    // This is now only used for display purposes, not triggering search
    // The actual search is triggered by handleSearchSubmit
  };

  // Handle search submit (Enter key or search button)
  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
  };

  // Handle content type change
  const handleContentTypeChange = (contentType: ContentTypeId) => {
    setActiveContentType(contentType);
  };

  // Handle social platform press
  const handlePlatformPress = async (platform: SocialPlatform) => {
    await openPlatformUrl(platform);
  };

  // Handle post social press
  const handlePostSocialPress = async (post: SocialPost, platformId: string) => {
    await handleSocialPress(post, platformId);
  };

  // Refresh YouTube videos
  const refreshYouTubeVideos = async () => {
    await fetchYouTubeVideos();
  };

  // Refresh Instagram posts
  const refreshInstagramPosts = async () => {
    await fetchInstagramPosts();
  };

  return {
    activeContentType,
    filteredPosts,
    searchQuery,
    searchResultInfo,
    handleSearchChange,
    handleSearchSubmit,
    handleContentTypeChange,
    handlePlatformPress,
    handlePostSocialPress,
    youtubeVideos,
    isLoadingYoutube,
    youtubeError,
    refreshYouTubeVideos,
    instagramPosts,
    isLoadingInstagram,
    instagramError,
    refreshInstagramPosts,
    // Add overall loading state
    isLoading: (isLoadingYoutube || isLoadingInstagram) && allPosts.length === 0,
  };
};
