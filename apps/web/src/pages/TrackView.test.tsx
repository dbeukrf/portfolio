import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import TrackView from './TrackView';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ trackId: 'university' })),
  };
});

describe('TrackView', () => {
  it('renders track title for university track', () => {
    renderWithRouter(<TrackView />);
    expect(screen.getByText('University Years')).toBeInTheDocument();
  });

  it('renders track navigation', () => {
    renderWithRouter(<TrackView />);
    expect(screen.getByText('← Home')).toBeInTheDocument();
  });
});
