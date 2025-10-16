/**
 * Platform Overview Component
 * Shows social media platforms for following CELF
 */

import React from 'react';
import { View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui';
import { Colors, Spacing, Layout } from '@/constants/design-tokens';
import { useSocialLinks } from '../hooks/useSocialLinks';
import type { SocialPlatform } from '../types';

interface PlatformOverviewProps {
  onPlatformPress: (platform: SocialPlatform) => void;
}

export const PlatformOverview: React.FC<PlatformOverviewProps> = ({
  onPlatformPress,
}) => {
  const { socialLinks, loading, error } = useSocialLinks();

  if (loading) {
    return (
      <View style={{ 
        marginBottom: Spacing['3xl'], 
        paddingBottom: Spacing.lg,
        alignItems: 'center',
        paddingVertical: Spacing.xl
      }}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Typography variant="body" color="secondary" style={{ marginTop: Spacing.sm }}>
          Loading social platforms...
        </Typography>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ 
        marginBottom: Spacing['3xl'], 
        paddingBottom: Spacing.lg,
        paddingHorizontal: Layout.screenMargin.mobile
      }}>
        <Typography variant="body" color="error" align="center">
          Unable to load social platforms. Please try again later.
        </Typography>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: Spacing['3xl'], paddingBottom: Spacing.lg }}>
      <View
        style={{ 
          paddingHorizontal: Layout.screenMargin.mobile, 
          marginBottom: Spacing.sm 
        }}>
        <Typography variant="h4" weight="medium">
          Follow CELF on Social Media
        </Typography>
      </View>

      <FlatList
        data={socialLinks}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingVertical: Spacing.md,
          paddingHorizontal: Layout.screenMargin.mobile,
        }}
        renderItem={({ item: platform }) => (
          <TouchableOpacity
            onPress={() => onPlatformPress(platform)}
            style={{
              alignItems: 'center',
              marginRight: Spacing.xl,
              minWidth: 50,
            }}>
            <View
              style={{
                width: 25,
                height: 25,
                borderRadius: 20,
                backgroundColor: platform.color + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: Spacing.xs,
                borderWidth: 1,
                borderColor: platform.color + '40',
              }}>
              <Ionicons name={platform.icon as any} size={10} color={platform.color} />
            </View>
            <Typography variant="caption" color="secondary" align="center">
              {platform.name}
            </Typography>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
