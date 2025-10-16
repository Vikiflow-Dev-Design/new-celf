/**
 * Network Error View
 * Displays error messages with retry functionality for network failures
 */

import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Spacing, Layout } from '@/constants/design-tokens';

interface NetworkErrorViewProps {
  error: string;
  onRetry: () => void;
  retryCount?: number;
  maxRetries?: number;
}

export const NetworkErrorView: React.FC<NetworkErrorViewProps> = ({
  error,
  onRetry,
  retryCount = 0,
  maxRetries = 2,
}) => {
  const themeColors = useThemeColors();

  return (
    <View style={{
      flex: 1,
      backgroundColor: themeColors.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Layout.screenMargin.mobile,
    }}>
      
      {/* Error Icon */}
      <View style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: themeColors.status.error + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing['2xl'],
      }}>
        <Ionicons 
          name="cloud-offline-outline" 
          size={40} 
          color={themeColors.status.error} 
        />
      </View>

      {/* Error Title */}
      <Typography 
        variant="h3" 
        weight="semibold" 
        style={{ 
          marginBottom: Spacing.md,
          textAlign: 'center',
        }}
      >
        Connection Error
      </Typography>

      {/* Error Message */}
      <Typography 
        variant="bodyMedium" 
        color="secondary" 
        style={{ 
          textAlign: 'center',
          marginBottom: Spacing['2xl'],
          lineHeight: 22,
        }}
      >
        {error}
      </Typography>

      {/* Retry Information */}
      {retryCount > 0 && (
        <Typography 
          variant="caption" 
          color="tertiary" 
          style={{ 
            marginBottom: Spacing.lg,
            textAlign: 'center',
          }}
        >
          Retry attempt {retryCount} of {maxRetries}
        </Typography>
      )}

      {/* Retry Button */}
      <TouchableOpacity
        onPress={onRetry}
        style={{
          backgroundColor: themeColors.primary.blue,
          paddingHorizontal: Spacing['2xl'],
          paddingVertical: Spacing.md,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: themeColors.primary.blue,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        }}
        activeOpacity={0.8}
      >
        <Ionicons 
          name="refresh-outline" 
          size={20} 
          color={themeColors.text.inverse} 
          style={{ marginRight: Spacing.sm }}
        />
        <Typography 
          variant="bodyMedium" 
          weight="semibold" 
          color="inverse"
        >
          Try Again
        </Typography>
      </TouchableOpacity>

      {/* Help Text */}
      <Typography 
        variant="caption" 
        color="tertiary" 
        style={{ 
          marginTop: Spacing['2xl'],
          textAlign: 'center',
          lineHeight: 18,
        }}
      >
        Please check your internet connection and try again.{'\n'}
        If the problem persists, contact support.
      </Typography>
    </View>
  );
};