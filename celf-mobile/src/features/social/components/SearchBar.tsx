/**
 * SearchBar Component
 * Search input with category filters for social content
 */

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui';
import { Colors, Spacing } from '@/constants/design-tokens';
import { useThemeColors } from '@/hooks/useThemeColors';
import type { ContentTypeId } from '../types';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  activeCategory: ContentTypeId;
  onCategoryChange: (category: ContentTypeId) => void;
  placeholder?: string;
}

const searchCategories = [
  { id: 'all', label: 'All Posts', icon: 'grid-outline' },
  { id: 'videos', label: 'Videos', icon: 'play-circle-outline' },
  { id: 'articles', label: 'Articles', icon: 'document-text-outline' },
  { id: 'images', label: 'Images', icon: 'image-outline' },
] as const;

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  activeCategory,
  onCategoryChange,
  placeholder = "Search posts, videos, articles...",
}) => {
  const themeColors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Update local query when searchQuery prop changes
  React.useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleSubmit = () => {
    if (localQuery.trim()) {
      onSearchSubmit(localQuery.trim());
    } else {
      // If empty, clear the search
      onSearchSubmit('');
    }
  };

  const handleClear = () => {
    setLocalQuery('');
    onSearchSubmit('');
  };

  return (
    <View style={{ marginBottom: Spacing.md }}>
      {/* Search Input */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: themeColors.background.tertiary,
          borderRadius: 12,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          marginBottom: Spacing.sm,
          borderWidth: 1,
          borderColor: isFocused ? themeColors.primary.blue : themeColors.border.secondary,
        }}>
        <Ionicons
          name="search-outline"
          size={20}
          color={themeColors.icon.secondary}
          style={{ marginRight: Spacing.sm }}
        />
        <TextInput
          value={localQuery}
          onChangeText={setLocalQuery}
          placeholder={placeholder}
          placeholderTextColor={themeColors.text.tertiary}
          style={{
            flex: 1,
            fontSize: 16,
            color: themeColors.text.primary,
            paddingVertical: 4,
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
        />
        
        {/* Search Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          style={{
            padding: 8,
            marginLeft: Spacing.xs,
            backgroundColor: themeColors.primary.blue,
            borderRadius: 8,
          }}>
          <Ionicons
            name="search"
            size={16}
            color={themeColors.icon.inverse}
          />
        </TouchableOpacity>
        
        {localQuery.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            style={{
              padding: 4,
              marginLeft: Spacing.xs,
            }}>
            <Ionicons
              name="close-circle"
              size={20}
              color={themeColors.icon.secondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filters */}
      <FlatList
        data={searchCategories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 2 }}
        renderItem={({ item: category }) => {
          const isActive = activeCategory === category.id;

          return (
            <TouchableOpacity
              onPress={() => onCategoryChange(category.id as ContentTypeId)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isActive 
                  ? themeColors.primary.blue 
                  : themeColors.background.tertiary,
                borderRadius: 20,
                paddingHorizontal: Spacing.md,
                paddingVertical: Spacing.sm,
                marginRight: Spacing.sm,
                borderWidth: 1,
                borderColor: isActive 
                  ? themeColors.primary.blue 
                  : themeColors.border.secondary,
                shadowColor: isActive ? themeColors.primary.blue : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isActive ? 0.2 : 0,
                shadowRadius: 4,
                elevation: isActive ? 3 : 0,
              }}>
              <Ionicons
                name={category.icon as any}
                size={16}
                color={isActive ? themeColors.icon.inverse : themeColors.icon.secondary}
                style={{ marginRight: Spacing.xs }}
              />
              <Typography
                variant="caption"
                weight="semibold"
                color={isActive ? 'inverse' : 'secondary'}>
                {category.label}
              </Typography>
            </TouchableOpacity>
          );
        }}
      />


    </View>
  );
};