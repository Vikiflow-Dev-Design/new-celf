/**
 * Professional Video Card Component
 * Modern, responsive video card with professional styling
 */

import React from 'react';
import { View, Image, TouchableOpacity, Linking, useWindowDimensions, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui';
import { Colors, Spacing, BorderRadius, shadows } from '@/constants/design-tokens';
import { useThemeColors } from '@/hooks/useThemeColors';
import { EngagementStats } from './EngagementStats';
import type { SocialPost } from '../types';

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows.md,
    height: 280, // Increased height for better proportions
  },
  
  thumbnailContainer: {
    position: 'relative',
    height: 160, // Increased thumbnail height for better aspect ratio
    width: '100%',
  },
  
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    objectFit: 'cover',
  },
  
  durationBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  
  playButtonOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  
  platformBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  videoInfo: {
    padding: 12,
    flex: 1,
    height: 120, // Increased info section height
    justifyContent: 'space-between',
  },
  
  title: {
    lineHeight: 18,
    marginBottom: 6,
    numberOfLines: 2,
    ellipsizeMode: 'tail',
  },
  
  channel: {
    marginBottom: 4,
  },
  
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  
  views: {
    fontSize: 12,
  },
  
  separator: {
    marginHorizontal: Spacing.xs,
    fontSize: 12,
  },
  
  publishedAt: {
    fontSize: 12,
  },
  
  engagementContainer: {
    marginTop: Spacing.xs,
  },
});

interface VideoCardProps {
  post: SocialPost;
  width?: number;
  onPress?: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ 
  post, 
  width,
  onPress 
}) => {
  const themeColors = useThemeColors();
  const { width: screenWidth } = useWindowDimensions();

  const handlePress = async () => {
    if (onPress) {
      onPress();
    } else if (post.url) {
      try {
        await Linking.openURL(post.url);
      } catch (error) {
        console.error('Error opening video:', error);
      }
    }
  };

  // Calculate responsive dimensions
  const cardWidth = width || screenWidth - (Spacing.lg * 2);
  const aspectRatio = 16 / 9;
  const imageHeight = cardWidth / aspectRatio;

  // Format view count for display
  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Get platform-specific styling
  const getPlatformColor = () => {
    switch (post.platform) {
      case 'youtube':
        return '#FF0000';
      case 'tiktok':
        return '#000000';
      case 'instagram':
        return '#E4405F';
      default:
        return themeColors.primary.blue;
    }
  };

  const renderPlayButton = () => (
    <View
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -28 }, { translateY: -28 }],
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.lg,
      }}>
      <Ionicons 
        name="play" 
        size={24} 
        color="white" 
        style={{ marginLeft: 2 }} // Slight offset for visual balance
      />
    </View>
  );

  const renderPlatformBadge = () => (
    <View
      style={{
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        backgroundColor: getPlatformColor(),
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        flexDirection: 'row',
        alignItems: 'center',
        ...shadows.md,
      }}>
      <Ionicons 
        name={post.platform === 'youtube' ? 'logo-youtube' : 'play'} 
        size={12} 
        color="white" 
        style={{ marginRight: Spacing.xs }}
      />
      <Typography variant="caption" color="inverse" weight="semibold">
        {post.platform?.toUpperCase() || 'VIDEO'}
      </Typography>
    </View>
  );

  const renderDurationBadge = () => (
    <View
      style={{
        position: 'absolute',
        bottom: Spacing.sm,
        right: Spacing.sm,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: BorderRadius.sm,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
      }}>
      <Typography variant="caption" color="inverse" weight="semibold">
        {post.time || '0:00'}
      </Typography>
    </View>
  );

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={{
        backgroundColor: themeColors.background.primary,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...shadows.md,
        marginBottom: Spacing.md,
        height: '100%', // Increased height for better proportions
      }}>
      
      {/* Video Thumbnail */}
      <View style={{ 
        position: 'relative',
        height: 250,
        width: '100%',
      }}>
        <Image
          source={{ uri: post.thumbnail || 'https://via.placeholder.com/320x180' }}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: themeColors.background.tertiary,
            borderRadius: 8,
            objectFit: 'cover',
          }}
          resizeMode="cover"
        />
        
        {/* Duration Badge */}
        {post.time && (
          <View style={{
            position: 'absolute',
            bottom: Spacing.sm,
            right: Spacing.sm,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: BorderRadius.sm,
            paddingHorizontal: Spacing.sm,
            paddingVertical: Spacing.xs,
          }}>
            <Typography
              variant="caption"
              color="inverse"
              weight="semibold"
              style={{ fontSize: 12 }}>
              {post.time}
            </Typography>
          </View>
        )}

        {/* Play Button Overlay */}
        <View style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: [{ translateX: -20 }, { translateY: -20 }],
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          alignItems: 'center',
          justifyContent: 'center',
          ...shadows.lg,
        }}>
          <Ionicons name="play" size={20} color="#000" style={{ marginLeft: 1 }} />
        </View>

        {/* Platform Badge */}
        <View style={{
          position: 'absolute',
          top: Spacing.sm,
          right: Spacing.sm,
          backgroundColor: getPlatformColor(),
          borderRadius: BorderRadius.md,
          paddingHorizontal: Spacing.sm,
          paddingVertical: Spacing.xs,
          flexDirection: 'row',
          alignItems: 'center',
          ...shadows.md,
        }}>
          <Ionicons 
            name={post.platform === 'youtube' ? 'logo-youtube' : 'play'} 
            size={12} 
            color="white" 
          />
        </View>
        
        {/* Gradient Overlay for better text readability */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
            backgroundColor: 'rgba(0,0,0,0.3)', // Fallback for React Native
          }}
        />
      </View>

      {/* Video Info */}
      <View style={{ 
        padding: 12,
        flex: 1,
        height: 120,
        justifyContent: 'space-between',
      }}>
        {/* Title */}
        <Typography
          variant="body2"
          weight="semibold"
          numberOfLines={2}
          style={{ 
            lineHeight: 18,
            marginBottom: 6,
            color: themeColors.text.primary,
          }}>
          {post.title}
        </Typography>
        
        <Typography
          variant="caption"
          color="secondary"
          numberOfLines={1}
          style={{ marginBottom: 4 }}>
          {post.author || 'Unknown Channel'}
        </Typography>
        
        <View style={{ 
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 6,
        }}>
          <Typography
            variant="caption"
            color="tertiary">
            {formatViewCount(post.views || 0)} views
          </Typography>
          <Typography
            variant="caption"
            color="tertiary"
            style={{ marginHorizontal: Spacing.xs }}>
            •
          </Typography>
          <Typography
            variant="caption"
            color="tertiary">
            {post.publishedAt || 'Recently'}
          </Typography>
        </View>

        {/* Engagement Stats - Compact Mode */}
        <EngagementStats
          engagement={{
            likes: post.likes || 0,
            shares: post.shares || 0,
            comments: post.comments || 0,
          }}
          compact={true}
        />
      </View>
    </TouchableOpacity>
  );
};