import TrackList from '../components/navigation/TrackList';

export default function AlbumView() {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-h1 mb-4">Diego's Portfolio Album</h1>
        <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
          Welcome to my interactive portfolio experience! Explore my journey through music-inspired tracks.
        </p>
      </div>
      <TrackList />
    </div>
  );
}
