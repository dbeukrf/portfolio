import TrackList from '../components/navigation/TrackList';

export default function AlbumView() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Diego's Portfolio Album</h1>
      <p className="text-lg text-gray-600 mb-8">Welcome to my interactive portfolio experience!</p>
      <TrackList />
    </div>
  );
}
