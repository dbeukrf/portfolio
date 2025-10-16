import { renderHook, act } from '@testing-library/react';
import { useNavigationStore } from './navigationStore';

describe('navigationStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useNavigationStore.getState().clearHistory();
    });
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useNavigationStore());
    
    expect(result.current.currentTrackId).toBeNull();
    expect(result.current.navigationHistory).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('sets current track correctly', () => {
    const { result } = renderHook(() => useNavigationStore());
    
    act(() => {
      result.current.setCurrentTrack('education');
    });
    
    expect(result.current.currentTrackId).toBe('education');
    expect(result.current.navigationHistory).toEqual(['education']);
  });

  it('adds track to navigation history when setting current track', () => {
    const { result } = renderHook(() => useNavigationStore());
    
    act(() => {
      result.current.setCurrentTrack('education');
    });
    
    act(() => {
      result.current.setCurrentTrack('workExperience');
    });
    
    expect(result.current.currentTrackId).toBe('workExperience');
    expect(result.current.navigationHistory).toEqual(['education', 'workExperience']);
  });

  it('navigates to track with loading state', async () => {
    const { result } = renderHook(() => useNavigationStore());
    
    act(() => {
      result.current.navigateToTrack('projects');
    });
    
    expect(result.current.currentTrackId).toBe('projects');
    expect(result.current.isLoading).toBe(true);
    expect(result.current.navigationHistory).toEqual(['projects']);
    
    // Wait for loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 350));
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  it('goes back to previous track correctly', () => {
    const { result } = renderHook(() => useNavigationStore());
    
    // Set up navigation history
    act(() => {
      result.current.setCurrentTrack('education');
      result.current.setCurrentTrack('workExperience');
      result.current.setCurrentTrack('projects');
    });
    
    expect(result.current.navigationHistory).toEqual(['education', 'workExperience', 'projects']);
    
    let previousTrack: string | null = null;
    act(() => {
      previousTrack = result.current.goBack();
    });
    
    expect(previousTrack).toBe('workExperience');
    expect(result.current.currentTrackId).toBe('workExperience');
    expect(result.current.navigationHistory).toEqual(['education', 'workExperience']);
  });

  it('returns null when going back with no history', () => {
    const { result } = renderHook(() => useNavigationStore());
    
    let previousTrack: string | null = null;
    act(() => {
      previousTrack = result.current.goBack();
    });
    
    expect(previousTrack).toBeNull();
    expect(result.current.currentTrackId).toBeNull();
    expect(result.current.navigationHistory).toEqual([]);
  });

  it('returns null when going back with single track in history', () => {
    const { result } = renderHook(() => useNavigationStore());
    
    act(() => {
      result.current.setCurrentTrack('education');
    });
    
    let previousTrack: string | null = null;
    act(() => {
      previousTrack = result.current.goBack();
    });
    
    expect(previousTrack).toBeNull();
    expect(result.current.currentTrackId).toBe('education');
    expect(result.current.navigationHistory).toEqual(['education']);
  });

  it('clears history correctly', () => {
    const { result } = renderHook(() => useNavigationStore());
    
    // Set up some history
    act(() => {
      result.current.setCurrentTrack('education');
      result.current.setCurrentTrack('workExperience');
    });
    
    expect(result.current.navigationHistory).toEqual(['education', 'workExperience']);
    
    act(() => {
      result.current.clearHistory();
    });
    
    expect(result.current.navigationHistory).toEqual([]);
    expect(result.current.currentTrackId).toBeNull();
  });

  it('sets loading state correctly', () => {
    const { result } = renderHook(() => useNavigationStore());
    
    act(() => {
      result.current.setLoading(true);
    });
    
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      result.current.setLoading(false);
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  it('maintains state across multiple hook instances', () => {
    const { result: result1 } = renderHook(() => useNavigationStore());
    const { result: result2 } = renderHook(() => useNavigationStore());
    
    act(() => {
      result1.current.setCurrentTrack('education');
    });
    
    expect(result2.current.currentTrackId).toBe('education');
    expect(result2.current.navigationHistory).toEqual(['education']);
  });
});
