import { create } from 'zustand';

export interface Track {
  id: string;
  title: string;
  description: string;
  duration: number;
  audioUrl: string;
  coverImageUrl?: string;
  order: number;
}

export interface TrackState {
  tracks: Track[];
  currentTrack: Track | null;
  isLoading: boolean;
  error: string | null;
}

export interface TrackActions {
  setTracks: (tracks: Track[]) => void;
  setCurrentTrack: (track: Track | null) => void;
  getTrackById: (id: string) => Track | undefined;
  getNextTrack: () => Track | null;
  getPreviousTrack: () => Track | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type TrackStore = TrackState & TrackActions;

const initialState: TrackState = {
  tracks: [],
  currentTrack: null,
  isLoading: false,
  error: null,
};

export const useTrackStore = create<TrackStore>((set, get) => ({
  ...initialState,
  
  setTracks: (tracks) => 
    set({ tracks: tracks.sort((a, b) => a.order - b.order) }),
  
  setCurrentTrack: (track) => 
    set({ currentTrack: track }),
  
  getTrackById: (id) => {
    const { tracks } = get();
    return tracks.find(track => track.id === id);
  },
  
  getNextTrack: () => {
    const { tracks, currentTrack } = get();
    if (!currentTrack) return tracks[0] || null;
    
    const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    return tracks[nextIndex] || null;
  },
  
  getPreviousTrack: () => {
    const { tracks, currentTrack } = get();
    if (!currentTrack) return tracks[tracks.length - 1] || null;
    
    const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    return tracks[prevIndex] || null;
  },
  
  setLoading: (loading) => 
    set({ isLoading: loading }),
  
  setError: (error) => 
    set({ error }),
  
  reset: () => 
    set(initialState),
}));
