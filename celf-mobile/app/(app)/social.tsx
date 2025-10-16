/**
 * Social Screen - Refactored
 * Reduced from 876 lines to ~60 lines by extracting components and logic
 */

import React from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@/components/navigation/NavigationContext';
import { Colors, Spacing, Layout } from '@/constants/design-tokens';
import { useThemeColors } from '@/hooks/useThemeColors';
import { router } from 'expo-router';
import { EmptySocialFeed } from '@/components/empty-states';
import { Typography } from '@/components/ui';
import { NetworkErrorState } from '@/src/features/tasks/components/NetworkErrorState';

// Extracted components
import {
  SocialHeader,
  SearchBar,
  PlatformOverview,
  PostItem,
  PostsGrid,
  SocialFeedSkeleton,
  PlatformOverviewSkeleton,
  ResponsiveGrid,
  VideoCard,
  ImageCard,
} from '@/src/features/social/components';

// Extracted hook
import { useSocial } from '@/src/features/social/hooks/useSocial';

export default function SocialScreen() {
  const { toggleSidebar } = useNavigation();
  const themeColors = useThemeColors();
  
  // All business logic extracted to custom hook
  const {
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
    isLoading,
  } = useSocial();

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background.secondary }}>
     

      {/* Content */}
      {isLoading ? (
        // Show skeleton loading while fetching YouTube data
        <ScrollView 
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={{ paddingTop: Spacing.md }}>
            {/* Search Bar */}
            <View style={{ paddingHorizontal: Layout.screenMargin.mobile }}>
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onSearchSubmit={handleSearchSubmit}
                activeCategory={activeContentType}
                onCategoryChange={handleContentTypeChange}
              />
            </View>

            {/* Platform Overview Skeleton - only for 'all' posts and no search */}
            {activeContentType === 'all' && !searchQuery.trim() && (
              <View style={{ paddingHorizontal: Layout.screenMargin.mobile }}>
                <PlatformOverviewSkeleton />
              </View>
            )}

            {/* Social Feed Skeleton */}
            <View style={{ paddingHorizontal: Layout.screenMargin.mobile }}>
              <SocialFeedSkeleton count={3} />
            </View>
          </View>
        </ScrollView>
      ) : youtubeError && filteredPosts.length === 0 ? (
        // Show error state if YouTube API failed and no posts are available
        <ScrollView 
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={{ paddingTop: Spacing.md }}>
            {/* Search Bar */}
            <View style={{ paddingHorizontal: Layout.screenMargin.mobile }}>
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onSearchSubmit={handleSearchSubmit}
                activeCategory={activeContentType}
                onCategoryChange={handleContentTypeChange}
              />
            </View>

            {/* Error State */}
            <View style={{ paddingHorizontal: Layout.screenMargin.mobile }}>
              <NetworkErrorState
                title="Unable to Load YouTube Content"
                description="We're having trouble loading YouTube videos. Please check your internet connection and try again."
                onRetry={() => {
                  if (youtubeError) refreshYouTubeVideos();
                }}
                error={youtubeError || ''}
              />
            </View>
          </View>
        </ScrollView>
      ) : filteredPosts.length === 0 ? (
        <ScrollView 
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={{ paddingTop: Spacing.md }}>
            {/* Search Bar */}
            <View style={{ paddingHorizontal: Layout.screenMargin.mobile }}>
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onSearchSubmit={handleSearchSubmit}
                activeCategory={activeContentType}
                onCategoryChange={handleContentTypeChange}
              />
            </View>

            {/* Empty State */}
            <View style={{ paddingHorizontal: Layout.screenMargin.mobile }}>
              <EmptySocialFeed
                title="No YouTube Content Yet"
                description="We're working on bringing you the latest YouTube videos from CELF. Check back soon!"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView 
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={{ paddingTop: Spacing.md }}>
            {/* Search Bar */}
            <View style={{ paddingHorizontal: Layout.screenMargin.mobile }}>
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onSearchSubmit={handleSearchSubmit}
                activeCategory={activeContentType}
                onCategoryChange={handleContentTypeChange}
              />
            </View>

            {/* Platform Overview - only for 'all' posts and no search */}
            {activeContentType === 'all' && !searchQuery.trim() && (
              <View style={{ marginBottom: Spacing.lg, paddingHorizontal: Layout.screenMargin.mobile }}>
                <PlatformOverview onPlatformPress={handlePlatformPress} />
              </View>
            )}

            {/* Search Results Info */}
            {searchResultInfo && searchResultInfo.showingFallback && (
              <View style={{ marginBottom: Spacing.md, paddingHorizontal: Layout.screenMargin.mobile }}>
                <View>
                  <Typography
                    variant="body2"
                    color="secondary"
                    style={{ textAlign: 'center', marginBottom: 4 }}>
                    No videos found for "{searchResultInfo.query}"
                  </Typography>
                  <Typography
                    variant="caption"
                    color="tertiary"
                    style={{ textAlign: 'center' }}>
                    Showing our latest YouTube videos instead
                  </Typography>
                </View>
              </View>
            )}

            {/* Social Media Posts - Responsive Grid Layout */}
            <ResponsiveGrid
              posts={filteredPosts}
              renderItem={({ item: post }) => {
                // Render different components based on platform
                if (post.platform === 'instagram') {
                  return (
                    <ImageCard
                      post={post}
                      onPress={() => handlePostSocialPress(post, post.platform || 'instagram')}
                    />
                  );
                } else {
                  return (
                    <VideoCard
                      post={post}
                      onPress={() => handlePostSocialPress(post, post.platform || 'youtube')}
                    />
                  );
                }
              }}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}
