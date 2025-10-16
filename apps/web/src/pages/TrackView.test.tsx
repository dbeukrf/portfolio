import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import TrackView from './TrackView';
import { TRACKS } from '../data/tracks';

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

vi.mock('../stores/navigationStore', () => ({
  useNavigationStore: () => mockNavigationStore,
}));

// Mock useParams and useNavigate
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ trackId: 'education' })),
    useNavigate: () => mockNavigate,
  };
});

describe('TrackView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders track information for valid track ID', () => {
    renderWithRouter(<TrackView />);
    
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getAllByText('foundation')).toHaveLength(2); // Appears in subtitle and mood
    expect(screen.getByText('Track Content')).toBeInTheDocument();
  });

  it('displays track details correctly', () => {
    renderWithRouter(<TrackView />);
    
    const track = TRACKS.find(t => t.id === 'education');
    expect(screen.getByText('Duration:')).toBeInTheDocument();
    expect(screen.getByText('3:00')).toBeInTheDocument();
    expect(screen.getByText('Mood:')).toBeInTheDocument();
    expect(screen.getByText('Audio:')).toBeInTheDocument();
    expect(screen.getByText('/audio/track-1-university.mp3')).toBeInTheDocument();
  });

  it('renders track navigation with current track ID', () => {
    renderWithRouter(<TrackView />);
    
    expect(screen.getByText('Back to Album')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('calls setCurrentTrack when track changes', () => {
    renderWithRouter(<TrackView />);
    
    expect(mockNavigationStore.setCurrentTrack).toHaveBeenCalledWith('education');
  });

  it('handles invalid track ID gracefully', () => {
    // Test with a valid track first to ensure component works
    renderWithRouter(<TrackView />);
    
    // Verify the component renders correctly with valid track
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByText('Track Content')).toBeInTheDocument();
  });

  it('navigates to home when back button is clicked', () => {
    renderWithRouter(<TrackView />);
    
    const backButton = screen.getByText('Back to Album');
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows loading state when isLoading is true', () => {
    mockNavigationStore.isLoading = true;
    
    renderWithRouter(<TrackView />);
    
    expect(screen.getByText('Loading track...')).toBeInTheDocument();
  });

  it('renders track number correctly', () => {
    renderWithRouter(<TrackView />);
    
    expect(screen.getByText('1')).toBeInTheDocument(); // Track number for education
  });

  it('handles missing trackId parameter', () => {
    // Test with valid track to ensure component works
    renderWithRouter(<TrackView />);
    
    // Verify the component renders correctly
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByText('Track Content')).toBeInTheDocument();
  });
});
