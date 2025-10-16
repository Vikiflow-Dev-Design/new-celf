/**
 * Post Content Component
 * Renders different types of post content (videos, images, articles, shorts, youtube)
 */

import React from 'react';
import { View, Image, TouchableOpacity, FlatList, Dimensions, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Typography } from '@/components/ui';
import { Colors, Spacing, Layout } from '@/constants/design-tokens';
import { EngagementStats } from './EngagementStats';
import { YouTubeShortsActions } from './YouTubeShortsActions';
import { YouTubeVideoCard } from './YouTubeVideoCard';
import type { SocialPost } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive sizing utility
const getResponsiveWidth = () => {
  if (SCREEN_WIDTH > Layout.breakpoints.tablet) {
    // Desktop: Use a maximum width for better viewing
    return Math.min(600, SCREEN_WIDTH * 0.6);
  } else if (SCREEN_WIDTH > Layout.breakpoints.mobile) {
    // Tablet: Use 80% of screen width
    return SCREEN_WIDTH * 0.8;
  } else {
    // Mobile: Use full width
    return SCREEN_WIDTH;
  }
};

const getResponsiveHeight = (contentType: string, aspectRatio: number = 16/9) => {
  const responsiveWidth = getResponsiveWidth();
  
  // All videos use 16:9 aspect ratio
  return responsiveWidth / aspectRatio;
};

interface PostContentProps {
  post: SocialPost;
}

export const PostContent: React.FC<PostContentProps> = ({ post }) => {
  const renderPlayIcon = () => (
    <View
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -30 }, { translateY: -30 }],
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Ionicons name="play" size={24} color="white" />
    </View>
  );

  const renderYouTubeIcon = () => (
    <View
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -30 }, { translateY: -30 }],
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FF0000',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Ionicons name="logo-youtube" size={32} color="white" />
    </View>
  );

  const renderTimeBadge = () => (
    <View
      style={{
        position: 'absolute',
        top: Spacing.md,
        left: Spacing.md,
        backgroundColor: Colors.neutral.black + '80',
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
      }}>
      <Typography variant="caption" color="inverse" weight="semibold">
        {post.time}
      </Typography>
    </View>
  );

  const renderDurationBadge = (duration?: string) => {
    if (!duration) return null;
    
    return (
      <View
        style={{
          position: 'absolute',
          bottom: Spacing.md,
          right: Spacing.md,
          backgroundColor: Colors.neutral.black + '80',
          borderRadius: 8,
          paddingHorizontal: Spacing.sm,
          paddingVertical: Spacing.xs,
        }}>
        <Typography variant="caption" color="inverse" weight="semibold">
          {duration}
        </Typography>
      </View>
    );
  };

  const handleYouTubePress = async () => {
    try {
      await Linking.openURL(post.url);
    } catch (error) {
      console.error('Error opening YouTube video:', error);
    }
  };

  // YouTube videos - use the new YouTube card layout
  if (post.platform === 'youtube' && post.contentType === 'videos') {
    return <YouTubeVideoCard post={post} />;
  }

  if (post.contentType === 'articles') {
    return (
      <Card>
        <Image
          source={{ uri: post.thumbnail }}
          style={{
            width: '100%',
            height: 150,
          }}
          resizeMode="cover"
        />
        <View style={{ padding: Spacing.md }}>
          <Typography
            variant="h5"
            weight="bold"
            numberOfLines={2}
            style={{ lineHeight: 24 }}>
            {post.title}
          </Typography>
          <Typography
            variant="body"
            numberOfLines={3}
            style={{ marginTop: Spacing.xs }}>
            {post.description}
          </Typography>
        </View>
      </Card>
    );
  }

  if (post.contentType === 'images') {
    const responsiveWidth = getResponsiveWidth();
    const imageSize = responsiveWidth / 2 - Spacing.xs;
    
    return (
      <View style={{ 
        position: 'relative',
        alignItems: 'center', // Center the content on larger screens
        width: '100%'
      }}>
        <FlatList
          data={[post.thumbnail]}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={{
                width: imageSize,
                height: imageSize,
                margin: Spacing.xs,
                borderRadius: SCREEN_WIDTH > Layout.breakpoints.mobile ? 8 : 0,
              }}
              resizeMode="cover"
            />
          )}
          keyExtractor={(item, index) => `${post.id}-${index}`}
          numColumns={2}
          contentContainerStyle={{
            width: responsiveWidth,
          }}
        />
        {renderTimeBadge()}
        <EngagementStats engagement={post.engagement} />
      </View>
    );
  }

  // Default: videos or other content types
  const responsiveWidth = getResponsiveWidth();
  const responsiveHeight = getResponsiveHeight('videos');
  
  return (
    <View style={{ 
      position: 'relative',
      alignItems: 'center', // Center the content on larger screens
      width: '100%'
    }}>
      <Image
        source={{ uri: post.thumbnail }}
        style={{
          width: responsiveWidth,
          height: responsiveHeight,
          backgroundColor: Colors.background.tertiary,
          borderRadius: SCREEN_WIDTH > Layout.breakpoints.mobile ? 12 : 0, // Add border radius on larger screens
        }}
        resizeMode="cover"
      />
      {renderPlayIcon()}
      {renderTimeBadge()}
      <EngagementStats engagement={post.engagement} />
    </View>
  );
};
