import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import AlbumView from './AlbumView';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AlbumView', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders the portfolio title prominently', () => {
    renderWithRouter(<AlbumView />);
    expect(screen.getByText('Diego Portfolio')).toBeInTheDocument();
  });

  it('renders the welcome message', () => {
    renderWithRouter(<AlbumView />);
    expect(screen.getByText('Welcome to my interactive portfolio experience! Explore my journey through music-inspired tracks.')).toBeInTheDocument();
  });

  it('renders the album tracks section', () => {
    renderWithRouter(<AlbumView />);
    expect(screen.getByText('Album Tracks')).toBeInTheDocument();
  });

  it('displays all five tracks with correct information', () => {
    renderWithRouter(<AlbumView />);
    
    // Check all track titles
    expect(screen.getByText('University Years')).toBeInTheDocument();
    expect(screen.getByText('Work Experience')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Skills')).toBeInTheDocument();
    expect(screen.getByText('Hobbies')).toBeInTheDocument();
    
    // Check all track descriptions
    expect(screen.getByText('Foundation & Learning')).toBeInTheDocument();
    expect(screen.getByText('Professional Growth')).toBeInTheDocument();
    expect(screen.getByText('Passion & Innovation')).toBeInTheDocument();
    expect(screen.getByText('The Tech Stack')).toBeInTheDocument();
    expect(screen.getByText('Beyond Code')).toBeInTheDocument();
    
    // Check track numbers
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('has a start button that navigates to first track', () => {
    renderWithRouter(<AlbumView />);
    
    const startButton = screen.getByText('Start Experience');
    expect(startButton).toBeInTheDocument();
    
    fireEvent.click(startButton);
    expect(mockNavigate).toHaveBeenCalledWith('/track/university');
  });

  it('allows navigation to individual tracks when clicked', () => {
    renderWithRouter(<AlbumView />);
    
    const universityTrack = screen.getByText('University Years');
    fireEvent.click(universityTrack);
    expect(mockNavigate).toHaveBeenCalledWith('/track/university');
    
    const workTrack = screen.getByText('Work Experience');
    fireEvent.click(workTrack);
    expect(mockNavigate).toHaveBeenCalledWith('/track/work');
  });

  it('supports keyboard navigation for track cards', () => {
    renderWithRouter(<AlbumView />);
    
    const universityTrack = screen.getByText('University Years').closest('[role="button"]');
    expect(universityTrack).toBeInTheDocument();
    
    // Test Enter key
    fireEvent.keyDown(universityTrack!, { key: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledWith('/track/university');
    
    // Test Space key
    fireEvent.keyDown(universityTrack!, { key: ' ' });
    expect(mockNavigate).toHaveBeenCalledWith('/track/university');
  });

  it('displays album artwork/hero visual', () => {
    renderWithRouter(<AlbumView />);
    
    // Check for the album artwork (D letter in circle)
    const albumArtwork = screen.getByText('D');
    expect(albumArtwork).toBeInTheDocument();
  });

  it('is responsive and accessible', () => {
    renderWithRouter(<AlbumView />);
    
    // Check that start button is accessible
    const startButton = screen.getByText('Start Experience');
    expect(startButton).toBeInTheDocument();
    expect(startButton.tagName).toBe('BUTTON');
    
    // Check for track cards - they should be focusable divs with role="button"
    const trackCards = screen.getAllByRole('button');
    expect(trackCards.length).toBe(6); // 5 track cards + 1 start button
    
    // Filter out the start button to check only track cards
    const trackCardButtons = trackCards.filter(card => 
      card.textContent?.includes('University Years') || 
      card.textContent?.includes('Work Experience') ||
      card.textContent?.includes('Projects') ||
      card.textContent?.includes('Skills') ||
      card.textContent?.includes('Hobbies')
    );
    
    expect(trackCardButtons.length).toBe(5);
    
    // Check that track cards have proper accessibility attributes
    trackCardButtons.forEach(card => {
      expect(card).toHaveAttribute('tabIndex', '0');
      expect(card).toHaveAttribute('role', 'button');
    });
  });
});
