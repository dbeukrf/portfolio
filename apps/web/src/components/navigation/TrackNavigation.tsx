import { useNavigate } from 'react-router-dom';
import { TRACKS, type TrackId } from '../../data/tracks';
import { useNavigationStore } from '../../stores/navigationStore';

interface TrackNavigationProps {
  currentTrackId?: TrackId;
}

export default function TrackNavigation({ currentTrackId }: TrackNavigationProps) {
  const navigate = useNavigate();
  const { navigateToTrack, clearHistory } = useNavigationStore();

  const currentIndex = currentTrackId ? TRACKS.findIndex(track => track.id === currentTrackId) : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < TRACKS.length - 1;

  const goToPrevious = () => {
    if (hasPrevious) {
      const previousTrackId = TRACKS[currentIndex - 1].id;
      navigateToTrack(previousTrackId);
      navigate(`/track/${previousTrackId}`);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      const nextTrackId = TRACKS[currentIndex + 1].id;
      navigateToTrack(nextTrackId);
      navigate(`/track/${nextTrackId}`);
    }
  };

  const goToHome = () => {
    clearHistory();
    navigate('/');
  };

  const goToTrack = (trackId: TrackId) => {
    navigateToTrack(trackId);
    navigate(`/track/${trackId}`);
  };

  return (
    <div className="bg-surface-light border-b border-border-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Back to Album Button */}
          <button
            onClick={goToHome}
            className="btn-secondary flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Album</span>
          </button>
          
          {/* Track Navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPrevious}
              disabled={!hasPrevious}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </button>
            
            <span className="text-sm text-text-secondary px-3 py-1 bg-surface-dark rounded-full">
              {currentIndex >= 0 ? `Track ${TRACKS[currentIndex].number} of ${TRACKS.length}` : ''}
            </span>
            
            <button
              onClick={goToNext}
              disabled={!hasNext}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>Next</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Track List for Quick Navigation */}
        <div className="pb-4">
          <div className="flex flex-wrap gap-2">
            {TRACKS.map((track) => (
              <button
                key={track.id}
                onClick={() => goToTrack(track.id)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  track.id === currentTrackId
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface-dark text-text-secondary hover:bg-primary-100 hover:text-primary-700'
                }`}
              >
                {track.number}. {track.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
