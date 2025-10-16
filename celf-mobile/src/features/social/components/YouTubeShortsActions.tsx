import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EngagementData {
  likes: number;
  comments: number;
  shares: number;
}

interface YouTubeShortsActionsProps {
  engagement: EngagementData;
  onLike: () => void;
  onDislike: () => void;
  onComment: () => void;
  onShare: () => void;
  onMore: () => void;
}

const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${Math.floor(count / 1000)}K`;
  }
  return count.toString();
};

interface ActionButtonProps {
  iconName: keyof typeof Ionicons.glyphMap;
  count?: number;
  onPress: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ iconName, count, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      alignItems: 'center',
      marginBottom: 24,
    }}
    activeOpacity={0.7}>
    <Ionicons
      name={iconName}
      size={26}
      color="white"
      style={{ marginBottom: 4 }}
    />
    {count !== undefined && (
      <Text
        style={{
          color: 'white',
          fontSize: 12,
          fontWeight: '500',
          textAlign: 'center',
        }}>
        {formatCount(count)}
      </Text>
    )}
  </TouchableOpacity>
);

export const YouTubeShortsActions: React.FC<YouTubeShortsActionsProps> = ({
  engagement,
  onLike,
  onDislike,
  onComment,
  onShare,
  onMore,
}) => {
  return (
    <View
      style={{
        position: 'absolute',
        right: 16,
        bottom: 120,
        alignItems: 'center',
        zIndex: 10,
      }}>
      <ActionButton
        iconName="thumbs-up-outline"
        count={engagement.likes}
        onPress={onLike}
      />
      <ActionButton
        iconName="thumbs-down-outline"
        onPress={onDislike}
      />
      <ActionButton
        iconName="chatbubble-outline"
        count={engagement.comments}
        onPress={onComment}
      />
      <ActionButton
        iconName="arrow-redo-outline"
        count={engagement.shares}
        onPress={onShare}
      />
      <ActionButton
        iconName="ellipsis-vertical"
        onPress={onMore}
      />
    </View>
  );
};