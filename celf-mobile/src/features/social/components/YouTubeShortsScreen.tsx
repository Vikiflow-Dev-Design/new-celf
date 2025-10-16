import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  PanGestureHandler,
  GestureHandlerRootView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { YouTubeShortsActions } from './YouTubeShortsActions';
import { useSocial } from '../hooks/useSocial';
import type { SocialPost } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoShortProps {
  video: SocialPost;
  isActive: boolean;
}

const VideoShort: React.FC<VideoShortProps> = ({ video, isActive }) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [muted, setMuted] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    if (disliked) setDisliked(false);
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <View style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor: '#000000',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {/* Video Background */}
      <Image
        source={{ uri: video.thumbnail }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        resizeMode="cover"
      />

      {/* Video Description Overlay - Top */}
      <View style={{
        position: 'absolute',
        top: 60,
        left: 16,
        right: 70, // Leave space for mute button
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}>
        <Text
          style={{
            color: 'white',
            fontSize: 14,
            lineHeight: 18,
            fontWeight: '500',
          }}
          numberOfLines={3}>
          {video.description || video.title}
        </Text>
      </View>

      {/* Channel Info Overlay - Bottom */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 70, // Leave space for action buttons
        paddingHorizontal: 16,
        paddingBottom: 24,
        paddingTop: 60,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 12,
        }}>
          {/* Channel Avatar */}
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#ff6b35',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: 'bold',
            }}>
              {(video.youtubeData?.channelTitle || video.author || 'C').charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            {/* Channel Name */}
            <Text style={{
              color: 'white',
              fontSize: 14,
              fontWeight: '600',
              marginBottom: 8,
            }}>
              {video.youtubeData?.channelTitle || video.author || 'Channel'}
            </Text>

            {/* Hashtags */}
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
            }}>
              {video.youtubeData?.tags?.slice(0, 3).map((tag, index) => (
                <Text
                  key={index}
                  style={{
                    color: 'white',
                    fontSize: 12,
                    opacity: 0.8,
                  }}>
                  #{tag}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <YouTubeShortsActions
        engagement={video.engagement}
        onLike={handleLike}
        onDislike={handleDislike}
        onComment={() => console.log('Comment pressed')}
        onShare={() => console.log('Share pressed')}
        onMore={() => console.log('More pressed')}
      />

      {/* Mute Button */}
      <TouchableOpacity
        onPress={() => setMuted(!muted)}
        style={{
          position: 'absolute',
          top: 60,
          right: 16,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Ionicons
          name={muted ? 'volume-mute' : 'volume-high'}
          size={20}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
};

export const YouTubeShortsScreen: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [activeTab, setActiveTab] = useState<'following' | 'foryou'>('foryou');
  
  const { youtubeVideos, isLoadingYoutube } = useSocial();
  
  // Filter for videos only (previously shorts)
  const videosForShorts = youtubeVideos.filter(video => video.contentType === 'videos');

  const handleSwipeGesture = (event: any) => {
    if (isScrolling) return;

    const { translationY, velocityY } = event.nativeEvent;
    
    // Swipe up (next video)
    if (translationY < -50 || velocityY < -500) {
      if (currentIndex < shortsVideos.length - 1) {
        setIsScrolling(true);
        setCurrentIndex(currentIndex + 1);
        setTimeout(() => setIsScrolling(false), 300);
      }
    }
    // Swipe down (previous video)
    else if (translationY > 50 || velocityY > 500) {
      if (currentIndex > 0) {
        setIsScrolling(true);
        setCurrentIndex(currentIndex - 1);
        setTimeout(() => setIsScrolling(false), 300);
      }
    }
  };

  if (isLoadingYoutube || videosForShorts.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{ color: 'white', fontSize: 16 }}>
            {isLoadingYoutube ? 'Loading Videos...' : 'No Videos available'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
        {/* Header */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 50,
          paddingBottom: 16,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}>
          <View style={{
            flexDirection: 'row',
            gap: 24,
          }}>
            <TouchableOpacity
              onPress={() => setActiveTab('following')}
              style={{
                paddingBottom: 4,
                borderBottomWidth: activeTab === 'following' ? 2 : 0,
                borderBottomColor: 'white',
              }}>
              <Text style={{
                color: 'white',
                fontSize: 14,
                fontWeight: '600',
                opacity: activeTab === 'following' ? 1 : 0.6,
              }}>
                Following
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setActiveTab('foryou')}
              style={{
                paddingBottom: 4,
                borderBottomWidth: activeTab === 'foryou' ? 2 : 0,
                borderBottomColor: 'white',
              }}>
              <Text style={{
                color: 'white',
                fontSize: 14,
                fontWeight: '600',
                opacity: activeTab === 'foryou' ? 1 : 0.6,
              }}>
                For You
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={{
            color: 'white',
            fontSize: 18,
            fontWeight: 'bold',
          }}>
            Videos
          </Text>

          <View style={{ width: 32 }} />
        </View>

        {/* Video Container */}
        <PanGestureHandler onGestureEvent={handleSwipeGesture}>
          <View style={{
            flex: 1,
            position: 'relative',
          }}>
            <View
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                transform: [{ translateY: -currentIndex * SCREEN_HEIGHT }],
              }}>
              {videosForShorts.map((video, index) => (
                <View
                  key={video.id}
                  style={{
                    width: SCREEN_WIDTH,
                    height: SCREEN_HEIGHT,
                  }}>
                  <VideoShort
                    video={video}
                    isActive={index === currentIndex}
                  />
                </View>
              ))}
            </View>
          </View>
        </PanGestureHandler>

        {/* Progress Indicator */}
        <View style={{
          position: 'absolute',
          top: 120,
          right: 16,
          flexDirection: 'column',
          gap: 4,
        }}>
          {videosForShorts.map((_, index) => (
            <View
              key={index}
              style={{
                width: 3,
                height: 32,
                borderRadius: 2,
                backgroundColor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.3)',
              }}
            />
          ))}
        </View>

        {/* Swipe Hint */}
        {currentIndex === 0 && (
          <View style={{
            position: 'absolute',
            bottom: 120,
            left: '50%',
            transform: [{ translateX: -50 }],
          }}>
            <Text style={{
              color: 'white',
              fontSize: 12,
              opacity: 0.5,
              textAlign: 'center',
            }}>
              Swipe up ↑
            </Text>
          </View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};