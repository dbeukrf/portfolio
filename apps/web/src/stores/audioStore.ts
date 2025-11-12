import { create } from 'zustand';

export interface AudioState {
  currentTrackId: string | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error: string | null;
  isShuffled: boolean;
  isLooping: boolean;
  isMuted: boolean;
  previousVolume: number; // Store volume before muting
}

export interface AudioActions {
  setCurrentTrack: (trackId: string | null) => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleShuffle: () => void;
  toggleLoop: () => void;
  toggleMute: () => void;
  reset: () => void;
}

export type AudioStore = AudioState & AudioActions;

const initialState: AudioState = {
  currentTrackId: null,
  isPlaying: false,
  volume: 0.5,
  currentTime: 0,
  duration: 0,
  isLoading: false,
  error: null,
  isShuffled: false,
  isLooping: false,
  isMuted: false,
  previousVolume: 0.5,
};

export const useAudioStore = create<AudioStore>((set) => ({
  ...initialState,
  
  setCurrentTrack: (trackId: string | null) => 
    set({ currentTrackId: trackId, currentTime: 0 }),
  
  play: () => 
    set({ isPlaying: true, error: null }),
  
  pause: () => 
    set({ isPlaying: false }),
  
  togglePlayPause: () => 
    set((state) => ({ isPlaying: !state.isPlaying })),
  
  setVolume: (volume: number) => 
    set({ volume: Math.max(0, Math.min(1, volume)) }),
  
  setCurrentTime: (time: number) => 
    set({ currentTime: time }),
  
  setDuration: (duration: number) => 
    set({ duration }),
  
  setLoading: (loading: boolean) => 
    set({ isLoading: loading }),
  
  setError: (error: string | null) => 
    set({ error, isLoading: false }),
  
  toggleShuffle: () => 
    set((state) => ({ isShuffled: !state.isShuffled })),
  
  toggleLoop: () => 
    set((state) => ({ isLooping: !state.isLooping })),
  
  toggleMute: () => 
    set((state) => {
      if (state.isMuted) {
        // Unmute: restore previous volume
        return { isMuted: false, volume: state.previousVolume };
      } else {
        // Mute: save current volume and set to 0
        return { isMuted: true, previousVolume: state.volume, volume: 0 };
      }
    }),
  
  reset: () => 
    set(initialState),
}));
