/**
 * Engagement Stats Component
 * Shows likes, shares, and comments for a post
 */

import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui';
import { Colors, Spacing } from '@/constants/design-tokens';
import { formatEngagementNumber } from '../utils';
import type { PostEngagement } from '../types';

interface EngagementStatsProps {
  engagement: PostEngagement;
  compact?: boolean;
}

export const EngagementStats: React.FC<EngagementStatsProps> = ({
  engagement,
  compact = false,
}) => {
  const statStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: compact ? 'transparent' : 'rgba(255, 255, 255, 0.95)',
    borderRadius: compact ? 0 : 20,
    paddingHorizontal: compact ? 0 : Spacing.sm,
    paddingVertical: compact ? 0 : 4,
    shadow: compact ? 'none' : `0 2px 4px ${Colors.neutral.black}1A`,
    elevation: compact ? 0 : 3,
    minWidth: compact ? 'auto' : 50,
    justifyContent: compact ? 'flex-start' as const : 'center' as const,
    marginRight: compact ? Spacing.md : 0,
  };

  const iconContainerStyle = (color: string) => ({
    width: compact ? 14 : 18,
    height: compact ? 14 : 18,
    borderRadius: compact ? 7 : 9,
    backgroundColor: compact ? 'transparent' : color + '20',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: compact ? Spacing.xs : 4,
  });

  if (compact) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Likes */}
        <View style={statStyle}>
          <Ionicons name="heart" size={12} color={Colors.secondary.error} />
          <Typography
            variant="caption"
            weight="medium"
            style={{ color: Colors.secondary.error, fontSize: 10, marginLeft: 2 }}>
            {formatEngagementNumber(engagement.likes)}
          </Typography>
        </View>

        {/* Comments */}
        <View style={statStyle}>
          <Ionicons name="chatbubble" size={12} color={Colors.secondary.info} />
          <Typography
            variant="caption"
            weight="medium"
            style={{ color: Colors.secondary.info, fontSize: 10, marginLeft: 2 }}>
            {formatEngagementNumber(engagement.comments)}
          </Typography>
        </View>

        {/* Shares */}
        <View style={statStyle}>
          <Ionicons name="share-social" size={12} color={Colors.secondary.success} />
          <Typography
            variant="caption"
            weight="medium"
            style={{ color: Colors.secondary.success, fontSize: 10, marginLeft: 2 }}>
            {formatEngagementNumber(engagement.shares)}
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        position: 'absolute',
        top: Spacing.md,
        right: Spacing.md,
        flexDirection: 'column',
        gap: Spacing.xs,
      }}>
      {/* Likes */}
      <View style={statStyle}>
        <View style={iconContainerStyle(Colors.secondary.error)}>
          <Ionicons name="heart" size={10} color={Colors.secondary.error} />
        </View>
        <Typography
          variant="caption"
          weight="bold"
          style={{ color: Colors.secondary.error, fontSize: 11 }}>
          {formatEngagementNumber(engagement.likes)}
        </Typography>
      </View>

      {/* Shares */}
      <View style={statStyle}>
        <View style={iconContainerStyle(Colors.secondary.success)}>
          <Ionicons name="share-social" size={10} color={Colors.secondary.success} />
        </View>
        <Typography
          variant="caption"
          weight="bold"
          style={{ color: Colors.secondary.success, fontSize: 11 }}>
          {formatEngagementNumber(engagement.shares)}
        </Typography>
      </View>

      {/* Comments */}
      <View style={statStyle}>
        <View style={iconContainerStyle(Colors.secondary.warning)}>
          <Ionicons name="chatbubble" size={10} color={Colors.secondary.warning} />
        </View>
        <Typography
          variant="caption"
          weight="bold"
          style={{ color: Colors.secondary.warning, fontSize: 11 }}>
          {formatEngagementNumber(engagement.comments)}
        </Typography>
      </View>
    </View>
  );
};
