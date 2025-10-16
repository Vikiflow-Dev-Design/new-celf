/**
 * Mining Store - Zustand
 * Manages mining state and integrates with miningService
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { secureStorage } from '@/utils/storage';
import { miningService } from '@/services/miningService';
import { apiService } from '@/services/apiService';

export interface MiningSession {
  id: string;
  startTime: number;
  endTime?: number;
  totalEarned: number;
  duration: number; // in milliseconds
  miningRate: number;
}

interface MiningState {
  // Current mining state
  isMining: boolean;
  currentBalance: number;
  totalEarned: number;
  miningRate: number;
  runtime: string;
  countdown: string;
  tokensPerSecond: number;
  isLoading: boolean;
  isInitialized: boolean;

  // New loading and error states
  isInitialLoading: boolean; // For skeleton loader on app launch/login
  networkError: string | null; // Error message for display
  retryCount: number; // Track retry attempts
  lastSyncTime: number; // For session expiry detection
  dataSource: 'fresh' | 'cached'; // Track data source for debugging

  // Mining history
  sessions: MiningSession[];
  totalLifetimeEarnings: number;
  totalMiningTime: number; // in milliseconds

  // Statistics
  dailyEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;

  // Actions
  startMining: () => Promise<void>;
  stopMining: () => Promise<void>;
  pauseMining: () => Promise<void>;
  resumeMining: () => Promise<void>;
  refreshMiningStatus: () => Promise<void>;
  updateBalance: (balance: number) => void;
  updateEarnings: (earnings: number) => void;
  updateRuntime: (runtime: string) => void;
  updateCountdown: (countdown: string) => void;
  updateMiningState: (isMining: boolean) => void;
  addSession: (session: MiningSession) => void;
  updateMiningRate: (rate: number) => void;
  resetBalance: (balance?: number) => void;
  calculateStatistics: () => void;
  initializeWithSession: () => Promise<void>;
  syncWithBackend: () => Promise<void>;
  isBackendSyncNeeded: () => boolean;
  useCachedState: () => void;
  resetInitialization: () => void;
  
  // New actions for skeleton loader and error handling
  initializeApp: () => Promise<void>; // Main initialization for app launch
  retryInitialization: () => Promise<void>; // Retry with error handling
  clearError: () => void; // Clear network error
  setDataSource: (source: 'fresh' | 'cached') => void; // Track data source
  checkSessionExpiry: () => Promise<void>; // Check if session expired
}

export const useMiningStore = create<MiningState>()(
  persist(
    (set, get) => ({
  // Initial state (in-memory only)
  isMining: false,
  currentBalance: 0, // Will be synced from wallet store
  totalEarned: 0,
  miningRate: 0.125,
  runtime: '0h 0m 0s',
  countdown: '24h 0m 0s',
  tokensPerSecond: 0.125 / 3600,
  isLoading: false, // Changed to false - skeleton loader will handle initial loading
  isInitialized: false,

  // New loading and error states
  isInitialLoading: true, // Start with skeleton loader on app launch
  networkError: null,
  retryCount: 0,
  lastSyncTime: 0,
  dataSource: 'cached', // Default to cached until fresh data is loaded

  // Session data (will be saved to database later)
  sessions: [],
  totalLifetimeEarnings: 0,
  totalMiningTime: 0,

  // Statistics
  dailyEarnings: 0,
  weeklyEarnings: 0,
  monthlyEarnings: 0,

      // Actions
      startMining: async () => {
        const state = get();
        if (!state.isMining) {
          try {
            set({ isLoading: true });
            await miningService.startMining();
            set({ isMining: true, isLoading: false });
          } catch (error) {
            console.error('Failed to start mining:', error);
            set({ isLoading: false });
            throw error;
          }
        }
      },

      stopMining: async () => {
        const state = get();
        if (state.isMining) {
          try {
            set({ isLoading: true });

            // Create session record before stopping
            const session: MiningSession = {
              id: Date.now().toString(),
              startTime: Date.now() - (state.totalEarned / state.tokensPerSecond * 1000),
              endTime: Date.now(),
              totalEarned: state.totalEarned,
              duration: state.totalEarned / state.tokensPerSecond * 1000,
              miningRate: state.miningRate,
            };

            // Stop mining on backend
            await miningService.stopMining();

            set((state) => ({
              isMining: false,
              isLoading: false,
              sessions: [...state.sessions, session],
              totalLifetimeEarnings: state.totalLifetimeEarnings + state.totalEarned,
              totalMiningTime: state.totalMiningTime + session.duration,
              totalEarned: 0, // Reset for next session
            }));

            // Recalculate statistics
            get().calculateStatistics();
          } catch (error) {
            console.error('Failed to stop mining:', error);
            set({ isLoading: false });
            throw error;
          }
        }
      },

      updateBalance: (balance: number) => {
        // Balance is now managed by wallet store, this is for compatibility
        set({ currentBalance: balance });
      },

      updateEarnings: (earnings: number) => {
        set({ totalEarned: earnings });
      },

      updateRuntime: (runtime: string) => {
        set({ runtime });
      },

      updateCountdown: (countdown: string) => {
        set({ countdown });
      },

      updateMiningState: (isMining: boolean) => {
        const state = get();
        // Only update if initialized to prevent initialization flash
        if (state.isInitialized) {
          set({ isMining });
        }
      },

      resetInitialization: () => {
        set({
          isInitialized: false,
          isLoading: true
        });
      },

      addSession: (session: MiningSession) => {
        set((state) => ({
          sessions: [...state.sessions, session],
          totalLifetimeEarnings: state.totalLifetimeEarnings + session.totalEarned,
          totalMiningTime: state.totalMiningTime + session.duration,
        }));
        get().calculateStatistics();
      },

      updateMiningRate: (rate: number) => {
        set({
          miningRate: rate,
          tokensPerSecond: rate / 3600,
        });
        miningService.updateMiningRate(rate);
      },

      refreshMiningStatus: async () => {
        try {
          console.log('Mining Store: Refreshing mining status...');
          // This will check for existing sessions and restore state
          await get().initializeWithSession();
        } catch (error) {
          console.error('Mining Store: Failed to refresh mining status:', error);
        }
      },

      resetBalance: (balance = 24.3564) => {
        set({
          currentBalance: balance,
          totalEarned: 0,
        });
      },

      // Initialize mining store with existing session data
      initializeWithSession: async () => {
        try {
          console.log('Mining Store: Initializing with existing session...');
          set({ isLoading: true });

          // Fetch current admin mining rate first
          await miningService.fetchCurrentMiningRate();

          // Check for existing session
          await miningService.checkExistingSession();
          const miningState = miningService.getState();

          console.log('Mining Store: State from service:', miningState);

          // Update store with restored session data
          // Only set isMining to true if there's actually an active session with a sessionId
          const hasActiveSession = miningState.isMining && miningState.sessionId;

          set({
            isMining: hasActiveSession,
            totalEarned: miningState.totalEarned,
            runtime: miningState.runtime,
            countdown: miningState.countdown,
            miningRate: miningState.miningRate,
            tokensPerSecond: miningState.tokensPerSecond,
            isLoading: false,
            isInitialized: true, // Mark as initialized to allow state updates
          });

          console.log('Mining Store: Initialized successfully:', {
            isMining: hasActiveSession,
            hasSessionId: !!miningState.sessionId,
            totalEarned: miningState.totalEarned,
            runtime: miningState.runtime
          });
        } catch (error) {
          console.error('Mining Store: Failed to initialize:', error);
          set({
            isLoading: false,
            isInitialized: true, // Mark as initialized even on error
            // Set safe default values on error
            isMining: false,
            totalEarned: 0,
            runtime: '0h 0m 0s',
            countdown: '24h 0m 0s',
            miningRate: 0.125,
            tokensPerSecond: 0.125 / 3600,
          });

          // Don't throw the error, just log it
          console.warn('Mining Store: Continuing with default values due to initialization error');
        }
      },

      calculateStatistics: () => {
        const state = get();
        const now = Date.now();
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

        const dailyEarnings = state.sessions
          .filter(session => session.startTime >= oneDayAgo)
          .reduce((total, session) => total + session.totalEarned, 0);

        const weeklyEarnings = state.sessions
          .filter(session => session.startTime >= oneWeekAgo)
          .reduce((total, session) => total + session.totalEarned, 0);

        const monthlyEarnings = state.sessions
          .filter(session => session.startTime >= oneMonthAgo)
          .reduce((total, session) => total + session.totalEarned, 0);

        set({
          dailyEarnings,
          weeklyEarnings,
          monthlyEarnings,
        });
      },

      // Check if backend sync is needed (only on app launch or after long time)
      isBackendSyncNeeded: () => {
        const state = get();
        // Always sync if not initialized
        if (!state.isInitialized) {
          return true;
        }

        // Sync if it's been more than 5 minutes since last sync
        const lastSyncTime = state.sessions.length > 0
          ? Math.max(...state.sessions.map(s => s.endTime || s.startTime))
          : 0;
        const timeSinceLastSync = Date.now() - lastSyncTime;
        return timeSinceLastSync > 5 * 60 * 1000; // 5 minutes
      },

      // Use cached state immediately (for navigation)
      useCachedState: () => {
        console.log('Mining Store: Using cached state for navigation');
        set({
          isLoading: false,
          isInitialized: true
        });
      },

      // Sync with backend only when needed (app launch)
      syncWithBackend: async () => {
        try {
          console.log('Mining Store: Syncing with backend...');
          set({ isLoading: true });

          // Fetch current admin mining rate
          await miningService.fetchCurrentMiningRate();

          // Check for existing session
          await miningService.checkExistingSession();
          const miningState = miningService.getState();

          console.log('Mining Store: Backend state received:', miningState);

          // Update store with backend data
          const hasActiveSession = miningState.isMining && miningState.sessionId;

          set({
            isMining: hasActiveSession,
            totalEarned: miningState.totalEarned,
            runtime: miningState.runtime,
            countdown: miningState.countdown,
            miningRate: miningState.miningRate,
            tokensPerSecond: miningState.tokensPerSecond,
            isLoading: false,
            isInitialized: true,
          });

          console.log('Mining Store: Backend sync complete');
        } catch (error) {
          console.error('Mining Store: Backend sync failed:', error);
          // Set safe defaults and mark as initialized
          set({
            isMining: false,
            totalEarned: 0,
            runtime: '0h 0m 0s',
            countdown: '24h 0m 0s',
            miningRate: 0.125,
            tokensPerSecond: 0.125 / 3600,
            isLoading: false,
            isInitialized: true,
          });
        }
      },

      // Initialize - use cached data first, sync with backend if needed
      initializeWithSession: async () => {
        try {
          console.log('Mining Store: Initializing...');

          // If we have cached data and don't need backend sync, use cached data immediately
          if (!get().isBackendSyncNeeded()) {
            console.log('Mining Store: Using cached data, no backend sync needed');
            get().useCachedState();
            return;
          }

          // Otherwise, sync with backend
          await get().syncWithBackend();
        } catch (error) {
          console.error('Mining Store: Failed to initialize:', error);
          set({
            isLoading: false,
            isInitialized: true,
          });
        }
      },

      // NEW ACTIONS FOR SKELETON LOADER AND ERROR HANDLING

      // Main initialization for app launch - shows skeleton loader
      initializeApp: async () => {
        try {
          console.log('Mining Store: Starting app initialization with skeleton loader...');
          
          set({ 
            isInitialLoading: true, 
            networkError: null, 
            retryCount: 0,
            dataSource: 'fresh' 
          });

          // Attempt to fetch fresh data from backend with retry logic
          await get().retryInitialization();
          
        } catch (error) {
          console.error('Mining Store: App initialization failed:', error);
          set({
            isInitialLoading: false,
            networkError: 'Failed to load mining data. Please check your connection.',
            isInitialized: true,
          });
        }
      },

      // Retry initialization with error handling (max 2 retries)
      retryInitialization: async () => {
        const state = get();
        const maxRetries = 2;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            console.log(`Mining Store: Initialization attempt ${attempt + 1}/${maxRetries + 1}`);
            
            set({ retryCount: attempt });

            // Fetch current admin mining rate first
            await miningService.fetchCurrentMiningRate();

            // Check for existing session
            await miningService.checkExistingSession();
            const miningState = miningService.getState();

            console.log('Mining Store: Fresh data received:', miningState);

            // Update store with fresh data
            const hasActiveSession = miningState.isMining && miningState.sessionId;

            set({
              isMining: hasActiveSession,
              totalEarned: miningState.totalEarned,
              runtime: miningState.runtime,
              countdown: miningState.countdown,
              miningRate: miningState.miningRate,
              tokensPerSecond: miningState.tokensPerSecond,
              isInitialLoading: false,
              isLoading: false,
              isInitialized: true,
              networkError: null,
              lastSyncTime: Date.now(),
              dataSource: 'fresh',
              retryCount: 0,
            });

            console.log('Mining Store: App initialization successful');
            return; // Success - exit retry loop

          } catch (error) {
            console.error(`Mining Store: Initialization attempt ${attempt + 1} failed:`, error);
            
            if (attempt === maxRetries) {
              // Final attempt failed
              throw new Error(`Failed to initialize after ${maxRetries + 1} attempts: ${error.message}`);
            }
            
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }
        }
      },

      // Clear network error and reset retry count
      clearError: () => {
        set({ 
          networkError: null, 
          retryCount: 0 
        });
      },

      // Set data source for debugging
      setDataSource: (source: 'fresh' | 'cached') => {
        set({ dataSource: source });
      },

      // Check if session expired and sync with backend
      checkSessionExpiry: async () => {
        try {
          console.log('Mining Store: Checking session expiry...');
          
          const state = get();
          if (!state.isMining) {
            console.log('Mining Store: Not mining, no session to check');
            return;
          }

          // Check with backend if session is still active
          await miningService.checkExistingSession();
          const miningState = miningService.getState();
          
          const hasActiveSession = miningState.isMining && miningState.sessionId;
          
          if (state.isMining && !hasActiveSession) {
            console.log('Mining Store: Session expired, updating store to inactive');
            
            // Session expired - update store to reflect backend state
            set({
              isMining: false,
              totalEarned: 0,
              runtime: '0h 0m 0s',
              countdown: '24h 0m 0s',
              lastSyncTime: Date.now(),
              dataSource: 'fresh',
            });
            
            console.log('Mining Store: Store updated to reflect session expiry');
          }
          
        } catch (error) {
          console.error('Mining Store: Failed to check session expiry:', error);
          // Don't throw error - this is a background check
        }
      },
    }),
    {
      name: 'celf-mining-storage',
      storage: createJSONStorage(() => secureStorage),
      // Only persist essential mining state, not loading states
      partialize: (state) => ({
        isMining: state.isMining,
        totalEarned: state.totalEarned,
        runtime: state.runtime,
        countdown: state.countdown,
        miningRate: state.miningRate,
        tokensPerSecond: state.tokensPerSecond,
        sessions: state.sessions,
        totalLifetimeEarnings: state.totalLifetimeEarnings,
        totalMiningTime: state.totalMiningTime,
        dailyEarnings: state.dailyEarnings,
        weeklyEarnings: state.weeklyEarnings,
        monthlyEarnings: state.monthlyEarnings,
        lastSyncTime: state.lastSyncTime, // Persist for session expiry detection
      }),
    }
  )
);
