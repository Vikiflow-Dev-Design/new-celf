import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Header } from '../../components/navigation/Header';
import { Typography } from '../../components/ui/Typography';
import { Colors, Spacing } from '@/constants/design-tokens';
import { apiService } from '../../services/apiService';
import { useAuthStore } from '../../stores/authStore';

interface RecentRecipient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  lastTransactionDate: string;
  lastTransactionAmount: number;
}

export default function RecentRecipientsScreen() {
  const [recentRecipients, setRecentRecipients] = useState<RecentRecipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuthStore();

  const fetchRecentRecipients = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await apiService.getRecentRecipients(20); // Get more recipients for the full list
      if (response.success && response.data) {
        setRecentRecipients(response.data);
      }
    } catch (error) {
      console.error('Error fetching recent recipients:', error);
      Alert.alert('Error', 'Failed to load recent recipients. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecentRecipients();
  }, []);

  const handleUserSelect = (selectedUser: RecentRecipient) => {
    // Prevent self-selection
    if (user && selectedUser.id === user.id) {
      Alert.alert(
        'Cannot Send to Yourself',
        'You cannot send tokens to your own account. Please select a different recipient.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Navigate to send amount screen with user data
    router.push({
      pathname: '/send-amount',
      params: {
        userId: selectedUser.id,
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        email: selectedUser.email,
        walletAddress: null, // Recent recipients don't have wallet address
      }
    });
  };

  const renderRecentUser = (user: RecentRecipient) => (
    <TouchableOpacity
      key={user.id}
      onPress={() => handleUserSelect(user)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background.primary,
        borderRadius: 12,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border.primary,
      }}
    >
      {/* Avatar */}
      <View style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primary.blue,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
      }}>
        <Typography variant="bodyLarge" color="inverse" weight="bold">
          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
        </Typography>
      </View>

      {/* User Info */}
      <View style={{ flex: 1 }}>
        <Typography variant="bodyMedium" weight="bold">
          {user.firstName} {user.lastName}
        </Typography>
        <Typography variant="bodySmall" color="secondary">
          {user.email}
        </Typography>
        <Typography variant="bodySmall" color="tertiary" style={{ marginTop: 2 }}>
          Last sent: {user.lastTransactionAmount} CELF
        </Typography>
      </View>

      {/* Arrow */}
      <Ionicons name="chevron-forward" size={20} color={Colors.icon.secondary} />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.secondary }}>
      <Header
        title="Recent Recipients"
        onBackPress={() => router.back()}
        rightAction={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={Colors.text.secondary} />
          </TouchableOpacity>
        }
      />

      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchRecentRecipients(true)}
            tintColor={Colors.primary.blue}
          />
        }
      >
        <View style={{
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.xl,
          paddingBottom: Spacing.xl,
        }}>
          {isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: Spacing.xl }}>
              <Typography variant="bodyMedium" color="secondary">
                Loading recent recipients...
              </Typography>
            </View>
          ) : recentRecipients.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: Spacing.xl }}>
              <Ionicons name="people-outline" size={48} color={Colors.icon.tertiary} />
              <Typography variant="h3" weight="bold" style={{ marginTop: Spacing.md, marginBottom: Spacing.sm }}>
                No Recent Recipients
              </Typography>
              <Typography variant="bodyMedium" color="secondary" style={{ textAlign: 'center' }}>
                You haven't sent tokens to anyone yet. Start by searching for users to send tokens to.
              </Typography>
            </View>
          ) : (
            <>
              <Typography variant="h3" weight="bold" style={{ marginBottom: Spacing.md }}>
                All Recent Recipients ({recentRecipients.length})
              </Typography>
              {recentRecipients.map(renderRecentUser)}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}