import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { TRACKS, type TrackId } from '../data/tracks';
import { useNavigationStore } from '../stores/navigationStore';
import TrackNavigation from '../components/navigation/TrackNavigation';

export default function TrackView() {
  const { trackId } = useParams<{ trackId: string }>();
  const navigate = useNavigate();
  const { setCurrentTrack, isLoading } = useNavigationStore();

  // Validate trackId and find the track
  const isValidTrackId = (id: string): id is TrackId => {
    return TRACKS.some(track => track.id === id);
  };

  const track = trackId && isValidTrackId(trackId) 
    ? TRACKS.find(t => t.id === trackId)
    : null;

  // Update navigation state when track changes
  useEffect(() => {
    if (track) {
      setCurrentTrack(track.id);
    }
  }, [track, setCurrentTrack]);

  // Handle invalid track ID
  if (!trackId || !track) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-h1 text-text-primary mb-4">Track Not Found</h1>
          <p className="text-body-lg text-text-secondary mb-8">
            The track "{trackId}" could not be found.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Back to Album
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark transition-all duration-300 ease-in-out">
      <TrackNavigation currentTrackId={track.id} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto transition-all duration-300 ease-in-out">
          {/* Loading State */}
          {isLoading && (
            <div className="fixed inset-0 bg-background-dark/50 flex items-center justify-center z-50">
              <div className="bg-surface-light rounded-lg p-6 flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <span className="text-text-primary">Loading track...</span>
              </div>
            </div>
          )}

          {/* Track Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {track.number}
              </div>
              <div>
                <h1 className="text-h1 text-text-primary">{track.title}</h1>
                <p className="text-body-lg text-text-secondary">{track.mood}</p>
              </div>
            </div>
          </div>

          {/* Track Content */}
          <div className="bg-surface-light rounded-lg p-8">
            <h2 className="text-h2 text-text-primary mb-4">Track Content</h2>
            <p className="text-body-lg text-text-secondary mb-6">
              This is the track view for: {track.title}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-h4 text-text-primary mb-2">Track Details</h3>
                <ul className="space-y-2 text-text-secondary">
                  <li><strong>Duration:</strong> {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</li>
                  <li><strong>Mood:</strong> {track.mood}</li>
                  <li><strong>Audio:</strong> {track.audioUrl}</li>
                </ul>
              </div>
              <div>
                <h3 className="text-h4 text-text-primary mb-2">Coming Soon</h3>
                <p className="text-text-secondary">
                  Content for this track will be implemented in future stories.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
