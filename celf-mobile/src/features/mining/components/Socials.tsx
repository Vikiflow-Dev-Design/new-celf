/**
 * Socials Component
 * Shows social media platform links
 */

import React from 'react';
import { View, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Typography } from '@/components/ui';
import { Colors, Spacing } from '@/constants/design-tokens';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSocialLinks } from '../../social/hooks/useSocialLinks';

interface SocialsProps {
  // Optional callback props for backward compatibility
  onTwitterPress?: () => void;
  onTelegramPress?: () => void;
  onDiscordPress?: () => void;
  onYouTubePress?: () => void;
}

export const Socials: React.FC<SocialsProps> = ({
  onTwitterPress,
  onTelegramPress,
  onDiscordPress,
  onYouTubePress,
}) => {
  const themeColors = useThemeColors();
  const { socialLinks, loading, error } = useSocialLinks();

  const handleSocialPress = async (platform: typeof socialLinks[0]) => {
    // Check for legacy callback handlers first
    const legacyHandlers: Record<string, (() => void) | undefined> = {
      'twitter': onTwitterPress,
      'telegram': onTelegramPress,
      'discord': onDiscordPress,
      'youtube': onYouTubePress,
    };

    const legacyHandler = legacyHandlers[platform.name.toLowerCase()];
    if (legacyHandler) {
      legacyHandler();
      return;
    }

    // Default behavior: open URL
    try {
      const supported = await Linking.canOpenURL(platform.baseUrl);
      if (supported) {
        await Linking.openURL(platform.baseUrl);
      } else {
        Alert.alert(
          'Cannot Open Link',
          `Unable to open ${platform.name}. Please check if the app is installed.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error opening social platform:', error);
      Alert.alert(
        'Error',
        'Something went wrong while trying to open the link.',
        [{ text: 'OK' }]
      );
    }
  };

  if (loading) {
    return (
      <Card variant="default" style={{ marginTop: Spacing['2xl'] }}>
        <Typography variant="h3" weight="semibold" style={{ marginBottom: Spacing.lg }}>
          Socials
        </Typography>
        <View style={{ alignItems: 'center', padding: Spacing.lg }}>
          <ActivityIndicator size="small" color={themeColors.icon.primary} />
        </View>
      </Card>
    );
  }

  if (error || socialLinks.length === 0) {
    return (
      <Card variant="default" style={{ marginTop: Spacing['2xl'] }}>
        <Typography variant="h3" weight="semibold" style={{ marginBottom: Spacing.lg }}>
          Socials
        </Typography>
        <Typography variant="bodyMedium" color="secondary" style={{ textAlign: 'center', padding: Spacing.lg }}>
          {error ? 'Unable to load social links' : 'No social links available'}
        </Typography>
      </Card>
    );
  }

  return (
    <Card variant="default" style={{ marginTop: Spacing['2xl'] }}>
      <Typography variant="h3" weight="semibold" style={{ marginBottom: Spacing.lg }}>
        Socials
      </Typography>

      <View style={{ gap: Spacing.md }}>
        {socialLinks.map((platform) => (
          <TouchableOpacity
            key={platform.id}
            onPress={() => handleSocialPress(platform)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: themeColors.background.tertiary,
              borderRadius: 12,
              padding: Spacing.lg,
            }}>
            <View style={{
              width: 40,
              height: 40,
              backgroundColor: platform.color + '15',
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: Spacing.md,
            }}>
              <Ionicons name={platform.icon as any} size={20} color={platform.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Typography variant="bodyMedium" weight="semibold" style={{ marginBottom: 2 }}>
                {platform.name}
              </Typography>
              <Typography variant="caption" color="secondary">
                Connect with CELF on {platform.name}
              </Typography>
            </View>
            <Ionicons name="chevron-forward" size={20} color={themeColors.icon.tertiary} />
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
};
