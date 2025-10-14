import { Routes, Route } from 'react-router-dom';
import Layout from './components/ui/Layout';
import AlbumView from './pages/AlbumView';
import TrackView from './pages/TrackView';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<AlbumView />} />
        <Route path="track/:trackId" element={<TrackView />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
