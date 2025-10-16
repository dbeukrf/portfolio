import { useParams, useNavigate } from 'react-router-dom';

const tracks = [
  { id: 'education', title: 'Education', number: 1 },
  { id: 'workExperience', title: 'Work Experience', number: 2 },
  { id: 'projects', title: 'Projects', number: 3 },
  { id: 'skillsLanguages', title: 'Skills & Languages', number: 4 },
  { id: 'hobbies', title: 'Hobbies', number: 5 },
  { id: 'aiDj', title: 'AI DJ', number: 6 }
];

export default function TrackNavigation() {
  const { trackId } = useParams<{ trackId: string }>();
  const navigate = useNavigate();

  const currentIndex = tracks.findIndex(track => track.id === trackId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < tracks.length - 1;

  const goToPrevious = () => {
    if (hasPrevious) {
      navigate(`/track/${tracks[currentIndex - 1].id}`);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      navigate(`/track/${tracks[currentIndex + 1].id}`);
    }
  };

  const goToHome = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-between py-4 border-b">
      <button
        onClick={goToHome}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        ← Home
      </button>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={goToPrevious}
          disabled={!hasPrevious}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        
        <span className="text-sm text-gray-500">
          {currentIndex >= 0 ? `Track ${tracks[currentIndex].number} of ${tracks.length}` : ''}
        </span>
        
        <button
          onClick={goToNext}
          disabled={!hasNext}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
