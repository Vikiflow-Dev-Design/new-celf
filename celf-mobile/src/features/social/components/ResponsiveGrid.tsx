/**
 * Responsive Grid Component
 * Adaptive grid layout for social media posts across different screen sizes
 * Desktop: 3-4 columns, Tablet: 2-3 columns, Mobile: 1-2 columns
 */

import React from 'react';
import { View, FlatList, Dimensions, useWindowDimensions } from 'react-native';
import { Spacing, Layout } from '@/constants/design-tokens';
import type { SocialPost } from '../types';

interface ResponsiveGridProps {
  posts: SocialPost[];
  renderItem: ({ item, index }: { item: SocialPost; index: number }) => React.ReactElement;
  contentContainerStyle?: any;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  posts,
  renderItem,
  contentContainerStyle,
}) => {
  const { width: screenWidth } = useWindowDimensions();

  // Calculate number of columns based on screen size
  const getNumColumns = () => {
    if (screenWidth > Layout.breakpoints.tablet) {
      // Desktop: 3 columns
      return 3;
    } else if (screenWidth > Layout.breakpoints.mobile) {
      // Tablet: 2 columns
      return 2;
    } else {
      // Mobile: 1 column
      return 1;
    }
  };

  // Calculate item width based on columns and spacing
  const getItemWidth = () => {
    const numColumns = getNumColumns();
    const horizontalPadding = Layout.screenMargin.mobile * 2;
    const totalSpacing = (numColumns - 1) * Spacing.md;
    const availableWidth = screenWidth - horizontalPadding - totalSpacing;
    return availableWidth / numColumns;
  };

  // Calculate responsive spacing
  const getSpacing = () => {
    if (screenWidth > Layout.breakpoints.tablet) {
      return Spacing.lg; // Desktop: larger spacing
    } else if (screenWidth > Layout.breakpoints.mobile) {
      return Spacing.md; // Tablet: medium spacing
    } else {
      return Spacing.sm; // Mobile: smaller spacing
    }
  };

  const numColumns = getNumColumns();
  const itemWidth = getItemWidth();
  const spacing = getSpacing();

  return (
    <FlatList
      data={posts}
      renderItem={({ item, index }) => (
        <View style={{ 
          width: itemWidth,
          marginBottom: spacing,
          marginRight: (index + 1) % numColumns === 0 ? 0 : spacing,
        }}>
          {renderItem({ item, index })}
        </View>
      )}
      keyExtractor={(item) => item.id.toString()}
      numColumns={numColumns}
      key={numColumns} // Force re-render when columns change
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        {
          paddingHorizontal: Layout.screenMargin.mobile,
          paddingBottom: Spacing['2xl'],
        },
        contentContainerStyle,
      ]}
      columnWrapperStyle={numColumns > 1 ? {
        justifyContent: 'flex-start',
      } : undefined}
    />
  );
};