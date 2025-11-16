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
    
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByText('Work Experience')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Skills & Languages')).toBeInTheDocument();
    expect(screen.getByText('AI DJ')).toBeInTheDocument();
  });

  it('renders track numbers', () => {
    renderWithRouter(<TrackList />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('has correct links to track pages', () => {
    renderWithRouter(<TrackList />);
    
    const educationLink = screen.getByText('Education');
    expect(educationLink.closest('a')).toHaveAttribute('href', '/track/education');
    
    const workLink = screen.getByText('Work Experience');
    expect(workLink.closest('a')).toHaveAttribute('href', '/track/workExperience');
    
    const projectsLink = screen.getByText('Projects');
    expect(projectsLink.closest('a')).toHaveAttribute('href', '/track/projects');
    
    const skillsLink = screen.getByText('Skills & Languages');
    expect(skillsLink.closest('a')).toHaveAttribute('href', '/track/skillsLanguages');
    
    const aiDjLink = screen.getByText('AI DJ');
    expect(aiDjLink.closest('a')).toHaveAttribute('href', '/track/aiDj');
  });

  it('renders the album tracks heading', () => {
    renderWithRouter(<TrackList />);
    expect(screen.getByText('Album Tracks')).toBeInTheDocument();
  });
});
