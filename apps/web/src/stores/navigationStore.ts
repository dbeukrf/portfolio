import { create } from 'zustand';
import { type TrackId } from '../data/tracks';

interface NavigationState {
  currentTrackId: TrackId | null;
  navigationHistory: TrackId[];
  isLoading: boolean;
  setCurrentTrack: (trackId: TrackId) => void;
  navigateToTrack: (trackId: TrackId) => void;
  goBack: () => TrackId | null;
  clearHistory: () => void;
  setLoading: (loading: boolean) => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  currentTrackId: null,
  navigationHistory: [],
  isLoading: false,

  setCurrentTrack: (trackId: TrackId) => {
    set((state) => ({
      currentTrackId: trackId,
      navigationHistory: [...state.navigationHistory, trackId],
    }));
  },

  navigateToTrack: (trackId: TrackId) => {
    set((state) => ({
      currentTrackId: trackId,
      navigationHistory: [...state.navigationHistory, trackId],
      isLoading: true,
    }));
    
    // Simulate loading state for smooth transitions
    setTimeout(() => {
      set({ isLoading: false });
    }, 300);
  },

  goBack: () => {
    const { navigationHistory } = get();
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remove current track
      const previousTrack = newHistory[newHistory.length - 1];
      
      set({
        currentTrackId: previousTrack,
        navigationHistory: newHistory,
      });
      
      return previousTrack;
    }
    return null;
  },

  clearHistory: () => {
    set({
      navigationHistory: [],
      currentTrackId: null,
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
