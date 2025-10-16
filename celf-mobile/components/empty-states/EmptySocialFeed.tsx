import React from 'react';
import { View, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Button, Card } from '@/components/ui';
import { Colors, Spacing, shadows } from '@/constants/design-tokens';
import { useSocialLinks } from '../../src/features/social/hooks/useSocialLinks';

interface EmptySocialFeedProps {
  title?: string;
  description?: string;
  style?: any;
}

export const EmptySocialFeed: React.FC<EmptySocialFeedProps> = ({
  title = "No Social Content Yet",
  description = "We're working on bringing you the latest CELF updates and community content. Check back soon!",
  style
}) => {
  const { socialLinks, loading } = useSocialLinks();

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      // Default refresh behavior
      Alert.alert('Refreshing', 'Checking for new posts...');
    }
  };

  const handleVisitPlatform = async (platform: typeof socialLinks[0]) => {
    if (onVisitSocialMedia) {
      onVisitSocialMedia(platform.id);
      return;
    }

    try {
      const supported = await Linking.canOpenURL(platform.url);
      if (supported) {
        await Linking.openURL(platform.url);
      } else {
        Alert.alert('Error', `Cannot open ${platform.name}`);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', `Failed to open ${platform.name}`);
    }
  };

  const handleVisitAllPlatforms = () => {
    Alert.alert(
      'Visit Social Media',
      'Choose a platform to visit our official CELF social media pages',
      [
        { text: 'Cancel', style: 'cancel' },
        ...socialLinks.map(platform => ({
          text: platform.name,
          onPress: () => handleVisitPlatform(platform)
        }))
      ]
    );
  };

  return (
    <View style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.xl,
      ...style
    }}>
      {/* Icon */}
      <View style={{
        width: 120,
        height: 120,
        backgroundColor: Colors.secondary.info + '10',
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
        ...shadows.sm
      }}>
        <Ionicons 
          name="chatbubbles-outline" 
          size={60} 
          color={Colors.secondary.info} 
        />
      </View>

      {/* Title */}
      <Typography 
        variant="h2" 
        color="primary" 
        weight="bold" 
        align="center"
        style={{ marginBottom: Spacing.sm }}
      >
        {title}
      </Typography>

      {/* Description */}
      <Typography 
        variant="bodyLarge" 
        color="secondary" 
        align="center"
        style={{ 
          marginBottom: Spacing.xl,
          lineHeight: 24,
          maxWidth: 300
        }}
      >
        {description}
      </Typography>

      {/* Social Media Platforms */}
      {!loading && socialLinks.length > 0 && (
        <Card style={{ 
          width: '100%', 
          marginBottom: Spacing.lg 
        }}>
          <Typography 
            variant="h4" 
            color="primary" 
            weight="semibold"
            style={{ marginBottom: Spacing.md }}
          >
            Follow CELF Official
          </Typography>
          
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: Spacing.sm,
            justifyContent: 'center'
          }}>
            {socialLinks.map((platform) => (
              <Button
                key={platform.id}
                title={platform.name}
                onPress={() => handleVisitPlatform(platform)}
                variant="secondary"
                size="small"
                icon={
                  <Ionicons 
                    name={platform.icon as any} 
                    size={16} 
                    color={platform.color} 
                  />
                }
                iconPosition="left"
                style={{
                  borderColor: platform.color + '40',
                  backgroundColor: platform.color + '10'
                }}
                textStyle={{ color: platform.color }}
              />
            ))}
          </View>
        </Card>
      )}

      {/* Community Info */}
      <View style={{
        backgroundColor: Colors.secondary.info + '10',
        borderRadius: 12,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
        width: '100%'
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: Spacing.sm
        }}>
          <Ionicons 
            name="information-circle-outline" 
            size={20} 
            color={Colors.secondary.info} 
          />
          <Typography 
            variant="bodyMedium" 
            color="info" 
            weight="semibold"
            style={{ marginLeft: Spacing.xs }}
          >
            Stay Updated
          </Typography>
        </View>
        
        <Typography 
          variant="bodySmall" 
          color="secondary"
          style={{ marginBottom: Spacing.xs }}
        >
          • Get the latest CELF news and updates
        </Typography>
        <Typography 
          variant="bodySmall" 
          color="secondary"
          style={{ marginBottom: Spacing.xs }}
        >
          • Connect with the mining community
        </Typography>
        <Typography 
          variant="bodySmall" 
          color="secondary"
        >
          • Learn about new features and improvements
        </Typography>
      </View>

      {/* Action Buttons */}
      <View style={{ width: '100%', gap: Spacing.sm }}>
        <Button
          title="Refresh Feed"
          onPress={handleRefresh}
          variant="primary"
          size="large"
          icon={<Ionicons name="refresh" size={20} color={Colors.text.inverse} />}
          iconPosition="left"
        />

        <Button
          title="Visit Social Media"
          onPress={handleVisitAllPlatforms}
          variant="secondary"
          size="large"
          icon={<Ionicons name="open-outline" size={20} color={Colors.primary.blue} />}
          iconPosition="left"
        />
      </View>

      {/* Help Text */}
      <View style={{ 
        marginTop: Spacing.lg,
        alignItems: 'center'
      }}>
        <Typography 
          variant="caption" 
          color="tertiary" 
          align="center"
        >
          Follow us for mining tips, community highlights, and announcements
        </Typography>
      </View>
    </View>
  );
};

export default EmptySocialFeed;
