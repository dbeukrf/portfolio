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

  it('renders track descriptions', () => {
    renderWithRouter(<TrackList />);
    
    expect(screen.getByText('Foundation & Learning')).toBeInTheDocument();
    expect(screen.getByText('Professional Growth')).toBeInTheDocument();
    expect(screen.getByText('Passion & Innovation')).toBeInTheDocument();
    expect(screen.getByText('The Tech Stack')).toBeInTheDocument();
    expect(screen.getByText('Beyond Code')).toBeInTheDocument();
  });

  it('renders track numbers', () => {
    renderWithRouter(<TrackList />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('has correct links to track pages', () => {
    renderWithRouter(<TrackList />);
    
    const universityLink = screen.getByText('University Years');
    expect(universityLink.closest('a')).toHaveAttribute('href', '/track/university');
    
    const workLink = screen.getByText('Work Experience');
    expect(workLink.closest('a')).toHaveAttribute('href', '/track/work');
    
    const projectsLink = screen.getByText('Projects');
    expect(projectsLink.closest('a')).toHaveAttribute('href', '/track/projects');
    
    const skillsLink = screen.getByText('Skills');
    expect(skillsLink.closest('a')).toHaveAttribute('href', '/track/skills');
    
    const hobbiesLink = screen.getByText('Hobbies');
    expect(hobbiesLink.closest('a')).toHaveAttribute('href', '/track/hobbies');
  });

  it('renders the album tracks heading', () => {
    renderWithRouter(<TrackList />);
    expect(screen.getByText('Album Tracks')).toBeInTheDocument();
  });
});
