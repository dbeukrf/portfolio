import { create } from 'zustand';

export interface AudioState {
  currentTrackId: string | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error: string | null;
}

export interface AudioActions {
  setCurrentTrack: (trackId: string) => void;
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type AudioStore = AudioState & AudioActions;

const initialState: AudioState = {
  currentTrackId: null,
  isPlaying: false,
  volume: 0.8,
  currentTime: 0,
  duration: 0,
  isLoading: false,
  error: null,
};

export const useAudioStore = create<AudioStore>((set) => ({
  ...initialState,
  
  setCurrentTrack: (trackId: string) => 
    set({ currentTrackId: trackId, currentTime: 0 }),
  
  play: () => 
    set({ isPlaying: true, error: null }),
  
  pause: () => 
    set({ isPlaying: false }),
  
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
  
  reset: () => 
    set(initialState),
}));
