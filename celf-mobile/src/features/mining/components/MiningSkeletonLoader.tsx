/**
 * Mining Skeleton Loader
 * Displays skeleton placeholders while loading mining data on app launch
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Spacing, Layout } from '@/constants/design-tokens';

interface SkeletonItemProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}

const SkeletonItem: React.FC<SkeletonItemProps> = ({ 
  width, 
  height, 
  borderRadius = 8, 
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
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
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
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

export const MiningSkeletonLoader: React.FC = () => {
  const themeColors = useThemeColors();

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: themeColors.background.secondary,
      paddingHorizontal: Layout.screenMargin.mobile,
      paddingTop: Spacing['2xl'],
    }}>
      
      {/* Balance Card Skeleton */}
      <View style={{
        backgroundColor: themeColors.background.primary,
        borderRadius: 16,
        padding: Spacing.lg,
        marginBottom: Spacing['2xl'],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}>
        <SkeletonItem width="40%" height={16} style={{ marginBottom: Spacing.sm }} />
        <SkeletonItem width="60%" height={32} style={{ marginBottom: Spacing.xs }} />
        <SkeletonItem width="30%" height={14} />
      </View>

      {/* Mining Button Skeleton */}
      <View style={{
        alignItems: 'center',
        marginBottom: Spacing['2xl'],
      }}>
        <SkeletonItem 
          width={200} 
          height={200} 
          borderRadius={100}
          style={{ marginBottom: Spacing.lg }}
        />
        <SkeletonItem width="50%" height={20} style={{ marginBottom: Spacing.sm }} />
        <SkeletonItem width="30%" height={16} />
      </View>

      {/* Mining Stats Skeleton */}
      <View style={{
        backgroundColor: themeColors.background.primary,
        borderRadius: 12,
        padding: Spacing.lg,
        marginBottom: Spacing['2xl'],
      }}>
        <SkeletonItem width="40%" height={18} style={{ marginBottom: Spacing.lg }} />
        
        {/* Stats Grid */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: Spacing.lg,
        }}>
          <View style={{ flex: 1, marginRight: Spacing.sm }}>
            <SkeletonItem width="100%" height={14} style={{ marginBottom: Spacing.xs }} />
            <SkeletonItem width="70%" height={20} />
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <SkeletonItem width="100%" height={14} style={{ marginBottom: Spacing.xs }} />
            <SkeletonItem width="70%" height={20} />
          </View>
        </View>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
          <View style={{ flex: 1, marginRight: Spacing.sm }}>
            <SkeletonItem width="100%" height={14} style={{ marginBottom: Spacing.xs }} />
            <SkeletonItem width="70%" height={20} />
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <SkeletonItem width="100%" height={14} style={{ marginBottom: Spacing.xs }} />
            <SkeletonItem width="70%" height={20} />
          </View>
        </View>
      </View>

      {/* Quick Actions Skeleton */}
      <View style={{
        backgroundColor: themeColors.background.primary,
        borderRadius: 12,
        padding: Spacing.lg,
        marginBottom: Spacing['2xl'],
      }}>
        <SkeletonItem width="40%" height={18} style={{ marginBottom: Spacing.lg }} />
        
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}>
          {[1, 2, 3, 4].map((item) => (
            <View key={item} style={{ alignItems: 'center' }}>
              <SkeletonItem 
                width={48} 
                height={48} 
                borderRadius={24}
                style={{ marginBottom: Spacing.sm }}
              />
              <SkeletonItem width={60} height={12} />
            </View>
          ))}
        </View>
      </View>

      {/* Social Links Skeleton */}
      <View style={{
        backgroundColor: themeColors.background.primary,
        borderRadius: 12,
        padding: Spacing.lg,
      }}>
        <SkeletonItem width="50%" height={18} style={{ marginBottom: Spacing.lg }} />
        
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}>
          {[1, 2, 3, 4].map((item) => (
            <SkeletonItem 
              key={item}
              width={48} 
              height={48} 
              borderRadius={24}
            />
          ))}
        </View>
      </View>
    </View>
  );
};