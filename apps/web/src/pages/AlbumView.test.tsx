import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AlbumView from './AlbumView';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AlbumView', () => {
  it('renders the album title', () => {
    renderWithRouter(<AlbumView />);
    expect(screen.getByText("Diego's Portfolio Album")).toBeInTheDocument();
  });

  it('renders the welcome message', () => {
    renderWithRouter(<AlbumView />);
    expect(screen.getByText('Welcome to my interactive portfolio experience! Explore my journey through music-inspired tracks.')).toBeInTheDocument();
  });

  it('renders the track list', () => {
    renderWithRouter(<AlbumView />);
    expect(screen.getByText('Album Tracks')).toBeInTheDocument();
  });
});
