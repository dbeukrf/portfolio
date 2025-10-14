import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isTyping: boolean;
  currentInput: string;
  isConnected: boolean;
  error: string | null;
}

export interface ChatActions {
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setTyping: (typing: boolean) => void;
  setCurrentInput: (input: string) => void;
  clearMessages: () => void;
  toggleChat: () => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type ChatStore = ChatState & ChatActions;

const initialState: ChatState = {
  messages: [],
  isOpen: false,
  isTyping: false,
  currentInput: '',
  isConnected: false,
  error: null,
};

export const useChatStore = create<ChatStore>((set) => ({
  ...initialState,
  
  addMessage: (message) => 
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        },
      ],
    })),
  
  setTyping: (typing) => 
    set({ isTyping: typing }),
  
  setCurrentInput: (input) => 
    set({ currentInput: input }),
  
  clearMessages: () => 
    set({ messages: [] }),
  
  toggleChat: () => 
    set((state) => ({ isOpen: !state.isOpen })),
  
  setConnected: (connected) => 
    set({ isConnected: connected }),
  
  setError: (error) => 
    set({ error }),
  
  reset: () => 
    set(initialState),
}));
