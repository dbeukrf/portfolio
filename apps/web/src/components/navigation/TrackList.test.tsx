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
    
    expect(screen.getByText('University Years')).toBeInTheDocument();
    expect(screen.getByText('Work Experience')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Skills')).toBeInTheDocument();
    expect(screen.getByText('Hobbies')).toBeInTheDocument();
  });

  it('has correct links to track pages', () => {
    renderWithRouter(<TrackList />);
    
    const universityLink = screen.getByText('University Years');
    expect(universityLink.closest('a')).toHaveAttribute('href', '/track/university');
    
    const workLink = screen.getByText('Work Experience');
    expect(workLink.closest('a')).toHaveAttribute('href', '/track/work');
  });
});
