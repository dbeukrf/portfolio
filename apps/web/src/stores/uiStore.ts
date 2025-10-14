import { create } from 'zustand';

export interface UIState {
  theme: 'light' | 'dark';
  isNavigationOpen: boolean;
  isModalOpen: boolean;
  modalContent: string | null;
  currentPage: string;
  isLoading: boolean;
}

export interface UIActions {
  setTheme: (theme: 'light' | 'dark') => void;
  toggleNavigation: () => void;
  openModal: (content: string) => void;
  closeModal: () => void;
  setCurrentPage: (page: string) => void;
  setLoading: (loading: boolean) => void;
}

export type UIStore = UIState & UIActions;

const initialState: UIState = {
  theme: 'light',
  isNavigationOpen: false,
  isModalOpen: false,
  modalContent: null,
  currentPage: 'home',
  isLoading: false,
};

export const useUIStore = create<UIStore>((set) => ({
  ...initialState,
  
  setTheme: (theme: 'light' | 'dark') => 
    set({ theme }),
  
  toggleNavigation: () => 
    set((state) => ({ isNavigationOpen: !state.isNavigationOpen })),
  
  openModal: (content: string) => 
    set({ isModalOpen: true, modalContent: content }),
  
  closeModal: () => 
    set({ isModalOpen: false, modalContent: null }),
  
  setCurrentPage: (page: string) => 
    set({ currentPage: page }),
  
  setLoading: (loading: boolean) => 
    set({ isLoading: loading }),
}));
