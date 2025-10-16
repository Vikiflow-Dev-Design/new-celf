import React from 'react';
import { View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Typography } from '@/components/ui';
import { Colors, Spacing, Layout } from '@/constants/design-tokens';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/stores/authStore';
import { performDirectLogout } from '@/utils/logout';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.8;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const themeColors = useThemeColors();
  const { user, isLoading } = useAuthStore();
  const [isMounted, setIsMounted] = React.useState(false);

  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const overlayOpacity = useSharedValue(0);

  React.useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  React.useEffect(() => {
    if (!isMounted) return;

    if (isOpen) {
      translateX.value = withTiming(0, { duration: 300 });
      overlayOpacity.value = withTiming(0.5, { duration: 300 });
    } else {
      translateX.value = withTiming(-SIDEBAR_WIDTH, { duration: 300 });
      overlayOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isOpen, isMounted]);

  const sidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const menuItems = [
    {
      title: 'Mining',
      icon: 'diamond',
      route: '/mining',
      // Special case: Mining uses accent color when active, primary when inactive
      isSpecial: true,
    },
    {
      title: 'Wallet',
      icon: 'wallet',
      route: '/wallet',
    },
    {
      title: 'Tasks',
      icon: 'checkmark-circle',
      route: '/tasks',
    },
    {
      title: 'Daily Challenges',
      icon: 'trophy',
      route: '/daily-challenges',
    },
    {
      title: 'Exchange',
      icon: 'swap-horizontal',
      route: '/exchange',
    },
    {
      title: 'Transaction History',
      icon: 'time',
      route: '/transaction-history',
    },
    {
      title: 'Send Tokens',
      icon: 'arrow-up-circle',
      route: '/send-tokens',
    },
    {
      title: 'Receive Tokens',
      icon: 'arrow-down-circle',
      route: '/receive-tokens',
    },
    {
      title: 'Referrals',
      icon: 'people',
      route: '/referrals',
    },
    {
      title: 'Social',
      icon: 'chatbubbles',
      route: '/social',
    },
    {
      title: 'Profile',
      icon: 'person',
      route: '/profile',
    },
    {
      title: 'Edit Profile',
      icon: 'create',
      route: '/edit-profile',
    },
  ];

  const bottomMenuItems = [
    {
      title: 'Settings',
      icon: 'settings-outline',
      route: '/settings',
    },
    {
      title: 'Help & Support',
      icon: 'help-circle-outline',
      route: '/help-center',
    },
    {
      title: 'About',
      icon: 'information-circle-outline',
      route: '/about',
    },
    {
      title: 'App Information',
      icon: 'phone-portrait-outline',
      route: '/app-information',
    },
    {
      title: 'Privacy Policy',
      icon: 'shield-checkmark-outline',
      route: '/privacy-policy',
    },
    {
      title: 'Terms & Conditions',
      icon: 'document-text-outline',
      route: '/terms-conditions',
    },
  ];

  const handleLogout = async () => {
    console.log('🧪 Testing utility-based direct logout...');
    try {
      onClose(); // Close sidebar first
      await performDirectLogout('Sidebar Navigation');
      console.log('✅ Utility direct logout completed');
    } catch (error) {
      console.error('❌ Utility direct logout failed:', error);
    }
  };

  const handleNavigation = (route: string) => {
    try {
      // Close sidebar first to prevent animation conflicts
      onClose();
      // Small delay to ensure sidebar animation starts before navigation
      setTimeout(() => {
        router.push(route as any);
      }, 50);
    } catch (error) {
      console.error('Navigation error:', error);
      onClose();
    }
  };



  // Always render but control visibility with animations

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      pointerEvents: isOpen ? 'auto' : 'none'
    }}>
      {/* Overlay */}
      <Animated.View
        style={[
          overlayStyle,
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: themeColors.isDark ? 'rgba(0, 0, 0, 0.8)' : Colors.neutral.black,
          }
        ]}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Sidebar */}
      <Animated.View
        style={[
          sidebarStyle,
          {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: SIDEBAR_WIDTH,
            backgroundColor: themeColors.background.primary,
            shadow: `2px 0 8px ${themeColors.isDark ? themeColors.background.primary : Colors.neutral.black}40`,
            elevation: 16,
          }
        ]}
      >
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={{
            paddingTop: 60,
            paddingHorizontal: Layout.screenMargin.mobile,
            paddingBottom: Spacing['2xl'],
            borderBottomWidth: 1,
            borderBottomColor: themeColors.border.secondary,
          }}>
            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              style={{
                alignSelf: 'flex-end',
                marginBottom: Spacing.lg,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: themeColors.background.tertiary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="close" size={20} color={themeColors.icon.secondary} />
            </TouchableOpacity>

            {/* App Title */}
            <View style={{ alignItems: 'center' }}>
              <Typography variant="h2" color="primary" weight="bold">
                CELF
              </Typography>
              <Typography variant="bodySmall" color="secondary">
                Mining & Wallet
              </Typography>
            </View>
          </View>

          {/* Main Navigation */}
          <View style={{ paddingVertical: Spacing.lg }}>
            {menuItems.map((item, index) => {
              const isActive = pathname === item.route;

              // Unified color system: Blue for all icons
              // Special case: Mining can use accent orange when mining is active
              const getItemColor = () => {
                if (item.isSpecial && item.title === 'Mining') {
                  // TODO: Check if mining is active from mining store
                  // For now, use primary blue for consistency
                  return themeColors.primary.blue;
                }
                return themeColors.primary.blue;
              };

              const itemColor = getItemColor();

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleNavigation(item.route)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: Layout.screenMargin.mobile,
                    paddingVertical: Spacing.lg,
                    backgroundColor: isActive ? themeColors.primary.blue + '10' : 'transparent',
                    borderRightWidth: isActive ? 3 : 0,
                    borderRightColor: themeColors.primary.blue,
                  }}
                >
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: isActive ? themeColors.primary.blue + '20' : (themeColors.isDark ? '#FFFFFF' : themeColors.background.tertiary),
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: Spacing.md,
                  }}>
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={itemColor}
                    />
                  </View>

                  <Typography
                    variant="bodyMedium"
                    weight={isActive ? 'semibold' : 'regular'}
                    color={isActive ? 'primary' : 'secondary'}
                  >
                    {item.title}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bottom Section */}
          <View style={{
            marginTop: 'auto',
            paddingTop: Spacing.lg,
            borderTopWidth: 1,
            borderTopColor: themeColors.border.secondary,
          }}>
            {/* Bottom Menu Items */}
            {bottomMenuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleNavigation(item.route)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: Layout.screenMargin.mobile,
                  paddingVertical: Spacing.lg,
                }}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: themeColors.isDark ? '#FFFFFF' : themeColors.background.tertiary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: Spacing.md,
                }}>
                  <Ionicons name={item.icon as any} size={20} color={themeColors.primary.blue} />
                </View>

                <Typography variant="bodyMedium" color="secondary">
                  {item.title}
                </Typography>
              </TouchableOpacity>
            ))}

            {/* Logout Button */}
            <TouchableOpacity
              onPress={handleLogout}
              disabled={isLoading}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: Layout.screenMargin.mobile,
                paddingVertical: Spacing.lg,
                marginTop: Spacing.md,
                borderTopWidth: 1,
                borderTopColor: themeColors.border.secondary,
              }}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: themeColors.status.error + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: Spacing.md,
              }}>
                <Ionicons name="log-out" size={20} color={themeColors.status.error} />
              </View>

              <View style={{ flex: 1 }}>
                <Typography variant="bodyMedium" color="error">
                  {isLoading ? 'Signing Out...' : 'Sign Out'}
                </Typography>
                <Typography variant="caption" color="tertiary" style={{ marginTop: 2 }}>
                  {user?.email}
                </Typography>
              </View>
            </TouchableOpacity>


          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};
