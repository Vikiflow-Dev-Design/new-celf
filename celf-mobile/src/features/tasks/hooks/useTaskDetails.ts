/**
 * Task Details Hook
 * Custom hook for task details functionality
 */

import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Share, AppState, Alert } from 'react-native';
import { apiService } from '@/services/apiService';
import { secureStorage } from '@/utils/storage';
import { useWalletStore } from '@/stores/walletStore';
import type { Task } from '../types';

export function useTaskDetails(taskId: string) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasReturnedFromExternalLink, setHasReturnedFromExternalLink] = useState(false);
  const [isClaimingToken, setIsClaimingToken] = useState(false);

  // Session state tracking for external link navigation
  const trackExternalLinkSession = async (taskId: string) => {
    try {
      if (!task?.linkUrl) return;
      
      const response = await apiService.createExternalLinkSession(taskId, task.linkUrl);
      
      if (response.success) {
        console.log('📱 External link session tracked for task:', taskId);
      } else {
        console.error('❌ Error tracking external link session:', response.message);
      }
    } catch (error) {
      console.error('❌ Error tracking external link session:', error);
    }
  };

  // Check if user has returned from external link
  const checkExternalLinkReturn = async (taskId: string) => {
    try {
      const response = await apiService.getExternalLinkSession(taskId);
      
      if (response.success && response.data) {
        const session = response.data;
        
        // If session exists and has visited external link
        if (session.hasVisitedExternalLink) {
          setHasReturnedFromExternalLink(true);
          console.log('✅ User has returned from external link for task:', taskId);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Error checking external link return:', error);
      return false;
    }
  };

  // Clear external link session
  const clearExternalLinkSession = async (taskId: string) => {
    try {
      const response = await apiService.clearExternalLinkSession(taskId);
      
      if (response.success) {
        console.log('🧹 External link session cleared for task:', taskId);
      } else {
        console.error('❌ Error clearing external link session:', response.message);
      }
    } catch (error) {
      console.error('❌ Error clearing external link session:', error);
    }
  };

  // Fetch task details from API
  const fetchTaskDetails = async () => {
    if (!taskId) {
      setError('Task ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📋 Fetching task details for ID:', taskId);
      const response = await apiService.getTaskDetails(taskId);

      if (response.success && response.data) {
        console.log('✅ Task details fetched successfully:', response.data);
        setTask(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch task details');
      }
    } catch (err) {
      console.error('❌ Error fetching task details:', err);

      // Enhanced error handling with specific error types and user-friendly messages
      let errorMessage = 'Failed to fetch task details';
      
      if (err instanceof Error) {
        if (err.message.includes('Network request failed') || err.message.includes('fetch')) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          errorMessage = 'Authentication failed. Please login again.';
          // Could add automatic redirect to login here
        } else if (err.message.includes('404') || err.message.includes('not found')) {
          errorMessage = 'Task not found. It may have been removed or is no longer available.';
        } else if (err.message.includes('500') || err.message.includes('Internal Server Error')) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.message.includes('403') || err.message.includes('Forbidden')) {
          errorMessage = 'You do not have permission to access this task.';
        } else {
          errorMessage = err.message || 'An unexpected error occurred';
        }
      }

      setError(errorMessage);
      setTask(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch task details on mount and when taskId changes
  useEffect(() => {
    fetchTaskDetails();
    
    // Check if user has returned from external link
    if (taskId) {
      checkExternalLinkReturn(taskId);
    }

    // Listen for app state changes to detect return from external link
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && taskId) {
        // Small delay to ensure the app has fully resumed
        setTimeout(() => {
          checkExternalLinkReturn(taskId);
        }, 500);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [taskId]);

  // Handle sharing task
  const handleShareTask = async () => {
    if (!task) return;

    try {
      const message = `Check out this CELF task: ${task.title}\n\n${task.description}\n\nReward: ${task.reward} CELF tokens`;
      
      await Share.share({
        message,
        title: `CELF Task: ${task.title}`,
      });
    } catch (err) {
      console.error('❌ Error sharing task:', err);
    }
  };

  // Handle claiming token after external link visit
  const handleClaimToken = async () => {
    if (!task || !hasReturnedFromExternalLink || isClaimingToken) {
      return;
    }

    // Prevent duplicate claims by checking current task state
    if (task.rewardClaimed) {
      Alert.alert(
        'Already Claimed',
        'You have already claimed the reward for this task.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsClaimingToken(true);
      console.log('💰 Claiming token for external link task:', task.id);

      // First, mark task as completed
      const completionResponse = await apiService.completeTask(task.id);
      if (!completionResponse.success) {
        throw new Error(completionResponse.message || 'Failed to complete task');
      }

      // Then claim the reward and add to non-sendable wallet
      const claimResponse = await apiService.claimTaskReward(task.id);
      if (!claimResponse.success) {
        // Handle specific duplicate claim error
        if (claimResponse.message?.includes('already claimed') || claimResponse.message?.includes('Reward already claimed')) {
          Alert.alert(
            'Already Claimed',
            'This reward has already been claimed. Please refresh the page to see the updated status.',
            [{ 
              text: 'Refresh', 
              onPress: async () => {
                await fetchTaskDetails();
                await clearExternalLinkSession();
              }
            }]
          );
          return;
        }
        throw new Error(claimResponse.message || 'Failed to claim reward');
      }

      console.log('✅ Token claimed successfully:', claimResponse.data);
      
      // Update wallet store with the new non-sendable balance
      const walletStore = useWalletStore.getState();
      walletStore.addMiningReward(task.reward);
      
      // Update task state
      setTask(prev => prev ? { 
        ...prev, 
        isCompleted: true, 
        rewardClaimed: true 
      } : null);
      
      // Clear the external link session
      await clearExternalLinkSession();
      setHasReturnedFromExternalLink(false);
      
      // Show success alert
      Alert.alert(
        'Success!',
        `You've successfully claimed ${task.reward} CELF tokens! They have been added to your non-sendable wallet balance.`,
        [{ text: 'OK' }]
      );
      
      return claimResponse.data;
    } catch (err) {
      console.error('❌ Error claiming token:', err);
      
      // Enhanced error handling with specific error types
      let errorTitle = 'Error';
      let errorMessage = 'Failed to claim token. Please try again.';
      let actions = [{ text: 'OK' }];

      if (err.message) {
        if (err.message.includes('Network request failed') || err.message.includes('fetch')) {
          errorTitle = 'Connection Error';
          errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
          actions = [
            { text: 'Cancel' },
            { 
              text: 'Retry', 
              onPress: () => handleClaimToken()
            }
          ];
        } else if (err.message.includes('timeout')) {
          errorTitle = 'Request Timeout';
          errorMessage = 'The request took too long to complete. Please try again.';
          actions = [
            { text: 'Cancel' },
            { 
              text: 'Retry', 
              onPress: () => handleClaimToken()
            }
          ];
        } else if (err.message.includes('Task not found')) {
          errorTitle = 'Task Not Found';
          errorMessage = 'This task could not be found. It may have been removed or is no longer available.';
          actions = [{ 
            text: 'Go Back', 
            onPress: () => router.back()
          }];
        } else if (err.message.includes('complete the task first')) {
          errorTitle = 'Task Not Completed';
          errorMessage = 'Please complete the task requirements before claiming your reward.';
        } else {
          errorMessage = err.message;
        }
      }
      
      Alert.alert(errorTitle, errorMessage, actions);
    } finally {
      setIsClaimingToken(false);
    }
  };

  // Enhanced handle open link with session tracking
  const handleOpenExternalLink = async () => {
    if (!task?.linkUrl) return;

    try {
      // Track that user is visiting external link
      await trackExternalLinkSession(task.id);
      
      // Open the external link (this will be handled by the component)
      return task.linkUrl;
    } catch (error) {
      console.error('❌ Error handling external link:', error);
      throw error;
    }
  };

  // Handle viewing all tasks
  const handleViewAllTasks = () => {
    router.push('/tasks');
  };

  // Handle going back
  const handleGoBack = () => {
    router.back();
  };

  // Handle claiming reward for completed tasks (non-external link tasks)
  const handleClaimReward = async () => {
    if (!task || !task.isCompleted || task.rewardClaimed) {
      return;
    }

    try {
      console.log('💰 Claiming reward for task:', task.id);

      // Claim the reward and add to non-sendable wallet
      const claimResponse = await apiService.claimTaskReward(task.id);
      if (!claimResponse.success) {
        // Handle specific duplicate claim error
        if (claimResponse.message?.includes('already claimed') || claimResponse.message?.includes('Reward already claimed')) {
          Alert.alert(
            'Already Claimed',
            'This reward has already been claimed. Please refresh the page to see the updated status.',
            [{ 
              text: 'Refresh', 
              onPress: async () => {
                await fetchTaskDetails();
              }
            }]
          );
          return;
        }
        throw new Error(claimResponse.message || 'Failed to claim reward');
      }

      console.log('✅ Reward claimed successfully:', claimResponse.data);
      
      // Update wallet store with the new non-sendable balance
      const walletStore = useWalletStore.getState();
      walletStore.addMiningReward(task.reward);
      
      // Update task state
      setTask(prev => prev ? { 
        ...prev, 
        rewardClaimed: true 
      } : null);
      
      // Show success alert
      Alert.alert(
        'Success!',
        `You've successfully claimed ${task.reward} CELF tokens! They have been added to your non-sendable wallet balance.`,
        [{ text: 'OK' }]
      );
      
      return claimResponse.data;
    } catch (err) {
      console.error('❌ Error claiming reward:', err);
      
      // Enhanced error handling with specific error types
      let errorTitle = 'Error';
      let errorMessage = 'Failed to claim reward. Please try again.';
      let actions = [{ text: 'OK' }];

      if (err.message) {
        if (err.message.includes('Network request failed') || err.message.includes('fetch')) {
          errorTitle = 'Connection Error';
          errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
          actions = [
            { text: 'Cancel' },
            { 
              text: 'Retry', 
              onPress: () => handleClaimReward()
            }
          ];
        } else if (err.message.includes('timeout')) {
          errorTitle = 'Request Timeout';
          errorMessage = 'The request took too long to complete. Please try again.';
          actions = [
            { text: 'Cancel' },
            { 
              text: 'Retry', 
              onPress: () => handleClaimReward()
            }
          ];
        } else if (err.message.includes('Task not found')) {
          errorTitle = 'Task Not Found';
          errorMessage = 'This task could not be found. It may have been removed or is no longer available.';
          actions = [{ 
            text: 'Go Back', 
            onPress: () => router.back()
          }];
        } else if (err.message.includes('complete the task first')) {
          errorTitle = 'Task Not Completed';
          errorMessage = 'Please complete the task requirements before claiming your reward.';
        } else {
          errorMessage = err.message;
        }
      }
      
      Alert.alert(errorTitle, errorMessage, actions);
    }
  };
  return {
    // Data
    task,
    
    // State
    loading,
    error,
    hasReturnedFromExternalLink,
    isClaimingToken,
    
    // Actions
    handleShareTask,
    handleClaimToken,
    handleClaimReward,
    handleOpenExternalLink,
    handleViewAllTasks,
    handleGoBack,
    fetchTaskDetails,
  };
}
