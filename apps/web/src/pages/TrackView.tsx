import { useParams } from 'react-router-dom';
import TrackNavigation from '../components/navigation/TrackNavigation';

const trackTitles: Record<string, string> = {
  university: 'University Years',
  work: 'Work Experience',
  projects: 'Projects',
  skills: 'Skills',
  hobbies: 'Hobbies',
};

export default function TrackView() {
  const { trackId } = useParams<{ trackId: string }>();
  const trackTitle = trackId ? trackTitles[trackId] || trackId : 'Unknown Track';

  return (
    <div>
      <TrackNavigation />
      <div className="mt-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{trackTitle}</h1>
        <p className="text-lg text-gray-600">
          This is the track view for: {trackId}
        </p>
        <p className="text-gray-500 mt-4">
          Content for this track will be implemented in future stories.
        </p>
      </div>
    </div>
  );
}
