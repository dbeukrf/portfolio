import { useNavigate } from 'react-router-dom';
import { TRACKS } from '../data/tracks';

export default function AlbumView() {
  const navigate = useNavigate();

  const handleStartExperience = () => {
    // Navigate to first track
    navigate('/track/university');
  };

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Hero Section with Album Artwork */}
      <div className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Album Artwork/Visual */}
            <div className="mb-8">
              <div className="w-48 h-48 mx-auto bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center shadow-2xl">
                <div className="text-6xl font-bold text-white">D</div>
              </div>
            </div>
            
            {/* Portfolio Title */}
            <h1 className="text-h1 mb-6 text-white">Diego Portfolio</h1>
            
            {/* Description */}
            <p className="text-body-lg text-white/90 max-w-2xl mx-auto mb-8">
              Welcome to my interactive portfolio experience! Explore my journey through music-inspired tracks.
            </p>
            
            {/* Start Button */}
            <button
              onClick={handleStartExperience}
              className="btn-accent text-lg px-8 py-4 rounded-lg font-semibold hover:scale-105 transform transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-accent-500/50"
            >
              Start Experience
            </button>
          </div>
        </div>
      </div>

      {/* Track List Section */}
      <div className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-h2 mb-12 text-center text-text-primary">Album Tracks</h2>
            
            {/* Track List */}
            <div className="space-y-4">
              {TRACKS.map((track) => (
                <div
                  key={track.id}
                  className="track-card group"
                  onClick={() => navigate(`/track/${track.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/track/${track.id}`);
                    }
                  }}
                >
                  <div className="flex items-center space-x-4">
                    {/* Track Number */}
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:bg-primary-600 transition-colors">
                      {track.number}
                    </div>
                    
                    {/* Track Info */}
                    <div className="flex-1">
                      <h3 className="text-h4 group-hover:text-primary-500 transition-colors">
                        {track.title}
                      </h3>
                      <p className="text-body-sm text-text-secondary">
                        {track.description}
                      </p>
                    </div>
                    
                    {/* Arrow Icon */}
                    <div className="flex-shrink-0">
                      <svg 
                        className="w-6 h-6 text-text-secondary group-hover:text-primary-500 transition-colors" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
