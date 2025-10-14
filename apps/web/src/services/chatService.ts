import { api } from './api';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  context?: string;
  trackId?: string;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  trackRecommendations?: string[];
}

// AI DJ Chat Service
export const chatService = {
  // Send message to AI DJ
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    try {
      const response = await api.post<ChatResponse>('/chat/message', request);
      return response.data;
    } catch (error) {
      console.error('Failed to send chat message:', error);
      throw new Error('Failed to send message to AI DJ');
    }
  },

  // Get chat history for current session
  getChatHistory: async (sessionId?: string): Promise<ChatMessage[]> => {
    try {
      const params = sessionId ? { sessionId } : {};
      const response = await api.get<ChatMessage[]>('/chat/history', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get chat history:', error);
      throw new Error('Failed to retrieve chat history');
    }
  },

  // Clear chat history
  clearHistory: async (sessionId?: string): Promise<void> => {
    try {
      const params = sessionId ? { sessionId } : {};
      await api.delete('/chat/history', { params });
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      throw new Error('Failed to clear chat history');
    }
  },

  // Get AI DJ suggestions based on current track
  getSuggestions: async (trackId: string): Promise<string[]> => {
    try {
      const response = await api.get<string[]>(`/chat/suggestions/${trackId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
      throw new Error('Failed to get AI suggestions');
    }
  },
};
