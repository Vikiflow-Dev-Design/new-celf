import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';

// List of all available Ionicons
// This is a subset of common icons - you can expand this list
const AVAILABLE_ICONS = [
  'logo-facebook', 'logo-twitter', 'logo-instagram', 'logo-linkedin',
  'logo-youtube', 'logo-tiktok', 'logo-snapchat', 'logo-pinterest',
  'logo-reddit', 'logo-github', 'logo-google', 'logo-apple',
  'logo-amazon', 'logo-android', 'logo-windows', 'logo-playstation',
  'logo-xbox', 'logo-discord', 'logo-twitch', 'logo-steam',
  'logo-whatsapp', 'logo-skype', 'logo-dropbox', 'logo-slack',
  'link', 'link-outline', 'globe', 'globe-outline',
  'mail', 'mail-outline', 'chatbubble', 'chatbubbles',
  'paper-plane', 'paper-plane-outline', 'share', 'share-outline',
  'musical-notes', 'musical-notes-outline', 'camera', 'camera-outline'
];

interface IconSelectorProps {
  onSelectIcon: (icon: string) => void;
  initialIcon?: string;
}

export const IconSelector: React.FC<IconSelectorProps> = ({ onSelectIcon, initialIcon = 'link-outline' }) => {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(initialIcon);
  const [filteredIcons, setFilteredIcons] = useState(AVAILABLE_ICONS);

  useEffect(() => {
    if (searchQuery) {
      const filtered = AVAILABLE_ICONS.filter(icon => 
        icon.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredIcons(filtered);
    } else {
      setFilteredIcons(AVAILABLE_ICONS);
    }
  }, [searchQuery]);

  const handleSelectIcon = (icon: string) => {
    setSelectedIcon(icon);
    onSelectIcon(icon);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.previewContainer}>
        <Text style={[styles.previewLabel, { color: colors.text }]}>Selected Icon:</Text>
        <View style={[styles.iconPreview, { backgroundColor: colors.card }]}>
          <Ionicons name={selectedIcon as any} size={32} color={colors.primary} />
          <Text style={[styles.iconName, { color: colors.text }]}>{selectedIcon}</Text>
        </View>
      </View>
      
      <TextInput
        style={[styles.searchInput, { backgroundColor: colors.card, color: colors.text }]}
        placeholder="Search icons..."
        placeholderTextColor={colors.text + '80'}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <FlatList
        data={filteredIcons}
        keyExtractor={(item) => item}
        numColumns={4}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.iconItem,
              { backgroundColor: selectedIcon === item ? colors.primary + '30' : 'transparent' }
            ]}
            onPress={() => handleSelectIcon(item)}
          >
            <View style={styles.iconWrapper}>
              <Ionicons name={item as any} size={24} color={colors.text} />
              <Text style={[styles.iconItemText, { color: colors.text }]} numberOfLines={1}>
                {item}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  iconPreview: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  iconName: {
    marginTop: 8,
    fontSize: 14,
  },
  searchInput: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  iconItem: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 4,
  },
  iconWrapper: {
    alignItems: 'center',
  },
  iconItemText: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
});