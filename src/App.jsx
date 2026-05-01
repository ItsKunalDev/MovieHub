import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { CustomMoviesProvider } from './context/CustomMoviesContext';
import Navbar from './components/Navbar';
import AdminNavbar from './components/AdminNavbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import MovieModal from './components/MovieModal';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import Profile from './pages/Profile';

function AppContent() {
  const { showAuthModal } = useAuth();
  const [selectedSearchMovie, setSelectedSearchMovie] = useState(null);
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <>
      {isAdmin ? <AdminNavbar /> : <Navbar onMovieSelect={setSelectedSearchMovie} />}

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/tv" element={<TVShows />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {!isAdmin && <Footer />}

      {showAuthModal && <AuthModal />}
      {selectedSearchMovie && (
        <MovieModal
          movie={selectedSearchMovie}
          onClose={() => setSelectedSearchMovie(null)}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WatchlistProvider>
        <FavoritesProvider>
          <CustomMoviesProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </CustomMoviesProvider>
        </FavoritesProvider>
      </WatchlistProvider>
    </AuthProvider>
  );
}
