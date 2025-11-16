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

  it('displays all six tracks with correct information', () => {
    renderWithRouter(<AlbumView />);
    
    // Check all track titles
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByText('Work Experience')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Skills & Languages')).toBeInTheDocument();
    expect(screen.getByText('AI DJ')).toBeInTheDocument();
    
    // Check track numbers
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('has a start button that navigates to first track', () => {
    renderWithRouter(<AlbumView />);
    
    const startButton = screen.getByText('Start Experience');
    expect(startButton).toBeInTheDocument();
    
    fireEvent.click(startButton);
    expect(mockNavigate).toHaveBeenCalledWith('/track/education');
  });

  it('allows navigation to individual tracks when clicked', () => {
    renderWithRouter(<AlbumView />);
    
    const educationTrack = screen.getByText('Education');
    fireEvent.click(educationTrack);
    expect(mockNavigate).toHaveBeenCalledWith('/track/education');
    
    const workTrack = screen.getByText('Work Experience');
    fireEvent.click(workTrack);
    expect(mockNavigate).toHaveBeenCalledWith('/track/workExperience');
  });

  it('supports keyboard navigation for track cards', () => {
    renderWithRouter(<AlbumView />);
    
    const educationTrack = screen.getByText('Education').closest('[role="button"]');
    expect(educationTrack).toBeInTheDocument();
    
    // Test Enter key
    fireEvent.keyDown(educationTrack!, { key: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledWith('/track/education');
    
    // Test Space key
    fireEvent.keyDown(educationTrack!, { key: ' ' });
    expect(mockNavigate).toHaveBeenCalledWith('/track/education');
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
    expect(trackCards.length).toBe(7); // 6 track cards + 1 start button
    
    // Filter out the start button to check only track cards
    const trackCardButtons = trackCards.filter(card => 
      card.textContent?.includes('About') ||
      card.textContent?.includes('Education') || 
      card.textContent?.includes('Work Experience') ||
      card.textContent?.includes('Projects') ||
      card.textContent?.includes('Skills & Languages') ||
      card.textContent?.includes('AI DJ')
    );
    
    expect(trackCardButtons.length).toBe(6);
    
    // Check that track cards have proper accessibility attributes
    trackCardButtons.forEach(card => {
      expect(card).toHaveAttribute('tabIndex', '0');
      expect(card).toHaveAttribute('role', 'button');
    });
  });
});
