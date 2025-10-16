/**
 * Professional Image Card Component
 * Modern, responsive image card for Instagram posts with professional styling
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
    height: 320, // Slightly taller for image content
  },
  
  imageContainer: {
    position: 'relative',
    height: 200, // Larger image area for better visual impact
    width: '100%',
  },
  
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    objectFit: 'cover',
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
  
  mediaTypeBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  imageInfo: {
    padding: 12,
    flex: 1,
    height: 120, // Info section height
    justifyContent: 'space-between',
  },
  
  title: {
    lineHeight: 18,
    marginBottom: 6,
    numberOfLines: 2,
    ellipsizeMode: 'tail',
  },
  
  username: {
    marginBottom: 4,
  },
  
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
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

interface ImageCardProps {
  post: SocialPost;
  width?: number;
  onPress?: () => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ 
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
        console.error('Error opening image post:', error);
      }
    }
  };

  // Calculate responsive dimensions
  const cardWidth = width || screenWidth - (Spacing.lg * 2);

  // Format engagement count for display
  const formatCount = (count: number) => {
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
      case 'instagram':
        return '#E4405F';
      case 'facebook':
        return '#1877F2';
      case 'twitter':
        return '#1DA1F2';
      default:
        return themeColors.primary.blue;
    }
  };

  // Get media type icon
  const getMediaTypeIcon = () => {
    switch (post.mediaType) {
      case 'VIDEO':
        return 'videocam';
      case 'CAROUSEL_ALBUM':
        return 'albums';
      case 'IMAGE':
      default:
        return 'image';
    }
  };

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
        name="logo-instagram" 
        size={12} 
        color="white" 
        style={{ marginRight: Spacing.xs }}
      />
      <Typography variant="caption" color="inverse" weight="semibold">
        {post.platform?.toUpperCase() || 'INSTAGRAM'}
      </Typography>
    </View>
  );

  const renderMediaTypeBadge = () => {
    if (post.mediaType === 'IMAGE') return null; // Don't show badge for regular images
    
    return (
      <View
        style={{
          position: 'absolute',
          top: Spacing.sm,
          left: Spacing.sm,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: BorderRadius.sm,
          paddingHorizontal: Spacing.sm,
          paddingVertical: Spacing.xs,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <Ionicons 
          name={getMediaTypeIcon()} 
          size={12} 
          color="white" 
          style={{ marginRight: Spacing.xs }}
        />
        <Typography variant="caption" color="inverse" weight="semibold">
          {post.mediaType === 'CAROUSEL_ALBUM' ? 'ALBUM' : post.mediaType}
        </Typography>
      </View>
    );
  };

  const renderVideoOverlay = () => {
    if (post.mediaType !== 'VIDEO') return null;
    
    return (
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
    );
  };

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
        height: 320, // Increased height for image content
      }}>
      
      {/* Image Container */}
      <View style={{ 
        position: 'relative',
        height: 200,
        width: '100%',
      }}>
        <Image
          source={{ uri: post.thumbnail || post.mediaUrl || 'https://via.placeholder.com/400x400' }}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: themeColors.background.tertiary,
            borderRadius: 8,
            objectFit: 'cover',
          }}
          resizeMode="cover"
        />
        
        {/* Platform Badge */}
        {renderPlatformBadge()}
        
        {/* Media Type Badge */}
        {renderMediaTypeBadge()}
        
        {/* Video Play Button Overlay */}
        {renderVideoOverlay()}
        
        {/* Gradient Overlay for better text readability */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 40,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.4))',
            backgroundColor: 'rgba(0,0,0,0.2)', // Fallback for React Native
          }}
        />
      </View>

      {/* Image Info */}
      <View style={{ 
        padding: 12,
        flex: 1,
        height: 120,
        justifyContent: 'space-between',
      }}>
        {/* Title/Caption */}
        <Typography
          variant="body2"
          weight="semibold"
          numberOfLines={2}
          style={{ 
            lineHeight: 18,
            marginBottom: 6,
            color: themeColors.text.primary,
          }}>
          {post.title || post.description || 'Instagram Post'}
        </Typography>
        
        {/* Username */}
        <Typography
          variant="caption"
          color="secondary"
          numberOfLines={1}
          style={{ marginBottom: 4 }}>
          @{post.username || post.author || 'instagram_user'}
        </Typography>
        
        {/* Meta Information */}
        <View style={{ 
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 6,
        }}>
          <Typography
            variant="caption"
            color="tertiary">
            {formatCount(post.likes || 0)} likes
          </Typography>
          {post.comments && (
            <>
              <Typography
                variant="caption"
                color="tertiary"
                style={{ marginHorizontal: Spacing.xs }}>
                •
              </Typography>
              <Typography
                variant="caption"
                color="tertiary">
                {formatCount(post.comments)} comments
              </Typography>
            </>
          )}
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