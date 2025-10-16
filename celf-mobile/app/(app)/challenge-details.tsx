import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function ChallengeDetailsScreen() {
  const colors = useThemeColors();
  const params = useLocalSearchParams();
  const { challengeId } = params;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: 15,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    challengeCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    challengeTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 10,
    },
    challengeDescription: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 24,
      marginBottom: 20,
    },
    rewardSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    rewardText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary,
      marginLeft: 10,
    },
    progressSection: {
      marginBottom: 20,
    },
    progressLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 10,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      width: '0%', // This would be dynamic based on actual progress
    },
    actionButton: {
      backgroundColor: colors.primary,
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    actionButtonText: {
      color: colors.surface,
      fontSize: 16,
      fontWeight: '600',
    },
    placeholderText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 40,
    },
  });

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenge Details</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.challengeCard}>
          <Text style={styles.challengeTitle}>Daily Mining Challenge</Text>
          <Text style={styles.challengeDescription}>
            Complete your daily mining session to earn bonus rewards and maintain your streak.
          </Text>

          <View style={styles.rewardSection}>
            <Ionicons name="trophy" size={24} color={colors.primary} />
            <Text style={styles.rewardText}>+50 CELF Bonus</Text>
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Progress</Text>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
          </View>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Start Challenge</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.placeholderText}>
          Challenge ID: {challengeId || 'Not specified'}
        </Text>
        <Text style={styles.placeholderText}>
          This is a placeholder screen. Challenge details and functionality will be implemented based on your requirements.
        </Text>
      </ScrollView>
    </View>
  );
}