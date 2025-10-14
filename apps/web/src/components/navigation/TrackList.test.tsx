import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TrackList from './TrackList';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('TrackList', () => {
  it('renders all track links', () => {
    renderWithRouter(<TrackList />);
    
    expect(screen.getByText('Track 1: University Years')).toBeInTheDocument();
    expect(screen.getByText('Track 2: Work Experience')).toBeInTheDocument();
    expect(screen.getByText('Track 3: Projects')).toBeInTheDocument();
    expect(screen.getByText('Track 4: Skills')).toBeInTheDocument();
    expect(screen.getByText('Track 5: Hobbies')).toBeInTheDocument();
  });

  it('has correct links to track pages', () => {
    renderWithRouter(<TrackList />);
    
    const universityLink = screen.getByText('Track 1: University Years');
    expect(universityLink.closest('a')).toHaveAttribute('href', '/track/university');
    
    const workLink = screen.getByText('Track 2: Work Experience');
    expect(workLink.closest('a')).toHaveAttribute('href', '/track/work');
  });
});
