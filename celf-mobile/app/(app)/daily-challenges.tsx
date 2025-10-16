import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  maxProgress: number;
  completed: boolean;
  icon: string;
}

export default function DailyChallengesScreen() {
  const colors = useThemeColors();
  
  // Mock data - replace with actual data from your API
  const [challenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'Daily Mining',
      description: 'Complete a 24-hour mining session',
      reward: 50,
      progress: 0,
      maxProgress: 1,
      completed: false,
      icon: 'hammer',
    },
    {
      id: '2',
      title: 'Social Sharing',
      description: 'Share CELF with 3 friends',
      reward: 25,
      progress: 1,
      maxProgress: 3,
      completed: false,
      icon: 'share-social',
    },
    {
      id: '3',
      title: 'Profile Update',
      description: 'Complete your profile information',
      reward: 15,
      progress: 1,
      maxProgress: 1,
      completed: true,
      icon: 'person',
    },
    {
      id: '4',
      title: 'Transaction Activity',
      description: 'Send tokens to another user',
      reward: 30,
      progress: 0,
      maxProgress: 1,
      completed: false,
      icon: 'send',
    },
  ]);

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
    sectionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
    },
    challengeCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    completedCard: {
      opacity: 0.7,
      backgroundColor: colors.success + '20',
    },
    challengeIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 15,
    },
    challengeContent: {
      flex: 1,
    },
    challengeTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 5,
    },
    challengeDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 10,
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
    },
    progressBar: {
      flex: 1,
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      marginRight: 10,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
    },
    progressText: {
      fontSize: 12,
      color: colors.textSecondary,
      minWidth: 40,
    },
    rewardContainer: {
      alignItems: 'center',
      marginLeft: 15,
    },
    rewardAmount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.primary,
    },
    rewardLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    completedBadge: {
      backgroundColor: colors.success,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    completedText: {
      color: colors.surface,
      fontSize: 12,
      fontWeight: '600',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 20,
    },
  });

  const handleBack = () => {
    router.back();
  };

  const handleChallengePress = (challenge: Challenge) => {
    router.push(`/challenge-details?challengeId=${challenge.id}`);
  };

  const renderChallenge = ({ item }: { item: Challenge }) => {
    const progressPercentage = (item.progress / item.maxProgress) * 100;
    
    return (
      <TouchableOpacity
        style={[styles.challengeCard, item.completed && styles.completedCard]}
        onPress={() => handleChallengePress(item)}
      >
        <View style={styles.challengeIcon}>
          <Ionicons 
            name={item.icon as any} 
            size={24} 
            color={item.completed ? colors.success : colors.primary} 
          />
        </View>
        
        <View style={styles.challengeContent}>
          <Text style={styles.challengeTitle}>{item.title}</Text>
          <Text style={styles.challengeDescription}>{item.description}</Text>
          
          {item.completed ? (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>Completed</Text>
            </View>
          ) : (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${progressPercentage}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {item.progress}/{item.maxProgress}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.rewardContainer}>
          <Text style={styles.rewardAmount}>+{item.reward}</Text>
          <Text style={styles.rewardLabel}>CELF</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Challenges</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Today's Challenges</Text>
        
        <FlatList
          data={challenges}
          renderItem={renderChallenge}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                No challenges available today.{'\n'}Check back tomorrow for new challenges!
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}