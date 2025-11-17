import { Routes, Route } from 'react-router-dom';
import Layout from './components/ui/Layout';
import AlbumView from './pages/AlbumView';
import Chatbot from './pages/Chatbot';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<AlbumView />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
