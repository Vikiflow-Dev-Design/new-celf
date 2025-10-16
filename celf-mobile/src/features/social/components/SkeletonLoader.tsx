/**
 * Skeleton Loading Components for Social Feed
 * Shows animated placeholders while content is loading
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/design-tokens';
import { useThemeColors } from '@/hooks/useThemeColors';

const { width: screenWidth } = Dimensions.get('window');

interface SkeletonItemProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const SkeletonItem: React.FC<SkeletonItemProps> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = BorderRadius.sm,
  style 
}) => {
  const themeColors = useThemeColors();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [themeColors.background.tertiary, themeColors.background.secondary],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor,
          borderRadius,
        },
        style,
      ]}
    />
  );
};

export const PostItemSkeleton: React.FC = () => {
  const themeColors = useThemeColors();
  
  return (
    <View
      style={{
        backgroundColor: themeColors.background.primary,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: themeColors.border.primary,
      }}>
      
      {/* Thumbnail */}
      <SkeletonItem
        width="100%"
        height={200}
        borderRadius={BorderRadius.md}
        style={{ marginBottom: Spacing.md }}
      />
      
      {/* Title */}
      <SkeletonItem
        width="85%"
        height={18}
        style={{ marginBottom: Spacing.sm }}
      />
      
      {/* Description line 1 */}
      <SkeletonItem
        width="100%"
        height={14}
        style={{ marginBottom: Spacing.xs }}
      />
      
      {/* Description line 2 */}
      <SkeletonItem
        width="70%"
        height={14}
        style={{ marginBottom: Spacing.md }}
      />
      
      {/* Bottom row with engagement and time */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center' 
      }}>
        {/* Engagement stats */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <SkeletonItem width={60} height={12} style={{ marginRight: Spacing.md }} />
          <SkeletonItem width={60} height={12} style={{ marginRight: Spacing.md }} />
          <SkeletonItem width={60} height={12} />
        </View>
        
        {/* Time */}
        <SkeletonItem width={50} height={12} />
      </View>
    </View>
  );
};

export const SocialFeedSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <View style={{ padding: Spacing.md }}>
      {Array.from({ length: count }, (_, index) => (
        <PostItemSkeleton key={index} />
      ))}
    </View>
  );
};

export const PlatformOverviewSkeleton: React.FC = () => {
  const themeColors = useThemeColors();
  
  return (
    <View
      style={{
        backgroundColor: themeColors.background.primary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: themeColors.border.primary,
      }}>
      
      {/* Title */}
      <SkeletonItem
        width="60%"
        height={20}
        style={{ marginBottom: Spacing.md }}
      />
      
      {/* Platform items */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {Array.from({ length: 4 }, (_, index) => (
          <View key={index} style={{ alignItems: 'center', flex: 1 }}>
            {/* Platform icon */}
            <SkeletonItem
              width={40}
              height={40}
              borderRadius={20}
              style={{ marginBottom: Spacing.sm }}
            />
            {/* Platform name */}
            <SkeletonItem width={50} height={12} />
          </View>
        ))}
      </View>
    </View>
  );
};