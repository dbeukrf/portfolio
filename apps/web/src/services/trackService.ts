import { api } from './api';

export interface Track {
  id: string;
  title: string;
  description: string;
  duration: number;
  audioUrl: string;
  coverImageUrl?: string;
  order: number;
  metadata?: {
    year?: number;
    tags?: string[];
    technologies?: string[];
  };
}

export interface TrackListResponse {
  tracks: Track[];
  total: number;
}

// Track Service for managing track data
export const trackService = {
  // Get all tracks
  getAllTracks: async (): Promise<Track[]> => {
    try {
      const response = await api.get<TrackListResponse>('/tracks');
      return response.data.tracks;
    } catch (error) {
      console.error('Failed to fetch tracks:', error);
      throw new Error('Failed to fetch tracks');
    }
  },

  // Get track by ID
  getTrackById: async (id: string): Promise<Track> => {
    try {
      const response = await api.get<Track>(`/tracks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch track ${id}:`, error);
      throw new Error(`Failed to fetch track ${id}`);
    }
  },

  // Get track audio URL
  getTrackAudioUrl: (trackId: string): string => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    return `${baseURL}/tracks/${trackId}/audio`;
  },

  // Get track cover image URL
  getTrackCoverUrl: (trackId: string): string => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    return `${baseURL}/tracks/${trackId}/cover`;
  },

  // Search tracks
  searchTracks: async (query: string): Promise<Track[]> => {
    try {
      const response = await api.get<TrackListResponse>('/tracks/search', {
        params: { q: query }
      });
      return response.data.tracks;
    } catch (error) {
      console.error('Failed to search tracks:', error);
      throw new Error('Failed to search tracks');
    }
  },
};
