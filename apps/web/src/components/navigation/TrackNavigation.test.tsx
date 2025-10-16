import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import TrackNavigation from './TrackNavigation';
import { TRACKS } from '../../data/tracks';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Mock navigation store
const mockNavigationStore = {
  currentTrackId: null,
  navigationHistory: [],
  isLoading: false,
  setCurrentTrack: vi.fn(),
  navigateToTrack: vi.fn(),
  goBack: vi.fn(),
  clearHistory: vi.fn(),
  setLoading: vi.fn(),
};

vi.mock('../../stores/navigationStore', () => ({
  useNavigationStore: () => mockNavigationStore,
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('TrackNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation controls', () => {
    renderWithRouter(<TrackNavigation />);
    
    expect(screen.getByText('Back to Album')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('renders track list for quick navigation', () => {
    renderWithRouter(<TrackNavigation />);
    
    TRACKS.forEach(track => {
      expect(screen.getByText(`${track.number}. ${track.title}`)).toBeInTheDocument();
    });
  });

  it('highlights current track in track list', () => {
    renderWithRouter(<TrackNavigation currentTrackId="education" />);
    
    const currentTrackButton = screen.getByText('1. Education');
    expect(currentTrackButton).toHaveClass('bg-primary-500', 'text-white');
  });

  it('disables previous button for first track', () => {
    renderWithRouter(<TrackNavigation currentTrackId="education" />);
    
    const previousButton = screen.getByRole('button', { name: /previous/i });
    expect(previousButton).toBeDisabled();
  });

  it('disables next button for last track', () => {
    renderWithRouter(<TrackNavigation currentTrackId="aiDj" />);
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('enables navigation buttons for middle tracks', () => {
    renderWithRouter(<TrackNavigation currentTrackId="projects" />);
    
    const previousButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });
    
    expect(previousButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it('navigates to previous track when previous button is clicked', () => {
    renderWithRouter(<TrackNavigation currentTrackId="workExperience" />);
    
    const previousButton = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(previousButton);
    
    expect(mockNavigationStore.navigateToTrack).toHaveBeenCalledWith('education');
    expect(mockNavigate).toHaveBeenCalledWith('/track/education');
  });

  it('navigates to next track when next button is clicked', () => {
    renderWithRouter(<TrackNavigation currentTrackId="education" />);
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    expect(mockNavigationStore.navigateToTrack).toHaveBeenCalledWith('workExperience');
    expect(mockNavigate).toHaveBeenCalledWith('/track/workExperience');
  });

  it('navigates to home and clears history when back to album is clicked', () => {
    renderWithRouter(<TrackNavigation />);
    
    const backButton = screen.getByText('Back to Album');
    fireEvent.click(backButton);
    
    expect(mockNavigationStore.clearHistory).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('navigates to specific track when track button is clicked', () => {
    renderWithRouter(<TrackNavigation />);
    
    const trackButton = screen.getByText('3. Projects');
    fireEvent.click(trackButton);
    
    expect(mockNavigationStore.navigateToTrack).toHaveBeenCalledWith('projects');
    expect(mockNavigate).toHaveBeenCalledWith('/track/projects');
  });

  it('displays correct track position', () => {
    renderWithRouter(<TrackNavigation currentTrackId="projects" />);
    
    expect(screen.getByText('Track 3 of 6')).toBeInTheDocument();
  });

  it('handles no current track gracefully', () => {
    renderWithRouter(<TrackNavigation />);
    
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('applies correct styling to non-current tracks', () => {
    renderWithRouter(<TrackNavigation currentTrackId="education" />);
    
    const nonCurrentTrack = screen.getByText('2. Work Experience');
    expect(nonCurrentTrack).toHaveClass('bg-surface-dark', 'text-text-secondary');
  });
});
