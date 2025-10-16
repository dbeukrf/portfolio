import { Link } from 'react-router-dom';
import { TRACKS } from '../../data/tracks';

export default function TrackList() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-h2 mb-8 text-center">Album Tracks</h2>
      <div className="grid gap-4 md:gap-6">
        {TRACKS.map((track) => (
          <Link
            key={track.id}
            to={`/track/${track.id}`}
            className="track-card group"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {track.number}
              </div>
              <div className="flex-1">
                <h3 className="text-h4 group-hover:text-primary-500 transition-colors">
                  {track.title}
                </h3>
              </div>
              <div className="flex-shrink-0">
                <svg 
                  className="w-6 h-6 text-text-secondary group-hover:text-primary-500 transition-colors" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
