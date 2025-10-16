import React from 'react';
import { View, Text, Image, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SocialPost } from '../types';

interface YouTubeVideoCardProps {
  post: SocialPost;
}

export const YouTubeVideoCard: React.FC<YouTubeVideoCardProps> = ({ post }) => {
  const isShorts = false; // No longer distinguishing shorts from regular videos
  const handlePress = async () => {
    try {
      await Linking.openURL(post.url);
    } catch (error) {
      console.error('Error opening YouTube video:', error);
    }
  };

  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatTimeAgo = (publishedAt: string): string => {
    const now = new Date();
    const published = new Date(publishedAt);
    const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else if (diffInHours < 24 * 30) {
      return `${Math.floor(diffInHours / (24 * 7))} weeks ago`;
    } else {
      return `${Math.floor(diffInHours / (24 * 30))} months ago`;
    }
  };

  const thumbnail = post.youtubeData?.thumbnail?.high || 
                   post.youtubeData?.thumbnail?.medium || 
                   post.youtubeData?.thumbnail?.default || 
                   post.thumbnail;

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <View style={{
        backgroundColor: '#0f0f0f',
        marginBottom: 16,
      }}>
        {/* Thumbnail Container */}
        <View style={{
          position: 'relative',
          width: '100%',
          height: isShorts ? 240 : 200,
          backgroundColor: '#1a1a1a',
        }}>
          <Image
            source={{ uri: thumbnail }}
            style={{
              width: '100%',
              height: '100%',
            }}
            resizeMode="cover"
          />
          
          {/* Duration Badge */}
          {post.youtubeData?.duration && (
            <View style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              borderRadius: 4,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}>
              <Text style={{
                color: 'white',
                fontSize: 12,
                fontWeight: '500',
              }}>
                {post.youtubeData.duration}
              </Text>
            </View>
          )}

          {/* Shorts Badge */}
          {isShorts && (
            <View style={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              borderRadius: 4,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}>
              <Text style={{
                color: 'white',
                fontSize: 12,
                fontWeight: '500',
              }}>
                SHORTS
              </Text>
            </View>
          )}
        </View>

        {/* Video Info */}
        <View style={{
          flexDirection: 'row',
          padding: 12,
          gap: 12,
        }}>
          {/* Channel Avatar */}
          <View style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: '#ff6b35',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{
              color: 'white',
              fontSize: 14,
              fontWeight: 'bold',
            }}>
              {(post.youtubeData?.channelTitle || post.author || 'C').charAt(0).toUpperCase()}
            </Text>
          </View>

          {/* Video Details */}
          <View style={{ flex: 1 }}>
            {/* Video Title */}
            <Text
              style={{
                color: 'white',
                fontSize: 14,
                fontWeight: '400',
                lineHeight: 20,
                marginBottom: 4,
              }}
              numberOfLines={2}>
              {post.title || post.description}
            </Text>

            {/* Channel Name and Metadata */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}>
              <Text style={{
                color: '#aaa',
                fontSize: 12,
                marginRight: 4,
              }}>
                {post.youtubeData?.channelTitle || post.author || 'Channel'}
              </Text>
              
              {post.youtubeData?.statistics?.viewCount && (
                <>
                  <Text style={{ color: '#aaa', fontSize: 12 }}>•</Text>
                  <Text style={{
                    color: '#aaa',
                    fontSize: 12,
                    marginLeft: 4,
                    marginRight: 4,
                  }}>
                    {formatViewCount(post.youtubeData.statistics.viewCount)} views
                  </Text>
                </>
              )}
              
              {post.youtubeData?.publishedAt && (
                <>
                  <Text style={{ color: '#aaa', fontSize: 12 }}>•</Text>
                  <Text style={{
                    color: '#aaa',
                    fontSize: 12,
                    marginLeft: 4,
                  }}>
                    {formatTimeAgo(post.youtubeData.publishedAt)}
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* More Options */}
          <TouchableOpacity
            style={{
              width: 24,
              height: 24,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Ionicons name="ellipsis-vertical" size={16} color="#aaa" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};