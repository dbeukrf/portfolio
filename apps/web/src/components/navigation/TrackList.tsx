import { Link } from 'react-router-dom';

const tracks = [
  { id: 'university', title: 'University Years', number: 1 },
  { id: 'work', title: 'Work Experience', number: 2 },
  { id: 'projects', title: 'Projects', number: 3 },
  { id: 'skills', title: 'Skills', number: 4 },
  { id: 'hobbies', title: 'Hobbies', number: 5 },
];

export default function TrackList() {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Tracks</h2>
      <ul className="space-y-2">
        {tracks.map((track) => (
          <li key={track.id}>
            <Link
              to={`/track/${track.id}`}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Track {track.number}: {track.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
