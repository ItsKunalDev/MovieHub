import { useState } from 'react';
import VerticalMovieRow from '../components/VerticalMovieRow';
import { getTVShows, getBollywoodTVShows } from '../api/imdb';
import MovieModal from '../components/MovieModal';
import { useCustomMovies } from '../context/CustomMoviesContext';
import './TVShows.css';

export default function TVShows() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const { customMovies } = useCustomMovies();
  const customOnlyTVShows = customMovies.filter(m => m.type === 'tv');

  return (
    <div className="page-tv">
      {/* ── Page Hero Header ── */}
      <div className="tv-hero">
        <div className="tv-hero-glow" />
        <div className="tv-hero-content">
          <span className="tv-hero-tag">Streaming Now</span>
          <h1 className="tv-hero-title">TV Shows</h1>
          <p className="tv-hero-sub">
            From gripping dramas to dark thrillers — handpicked series for every mood.
          </p>
        </div>
      </div>

      {/* ── Sections ── */}
      <div className="tv-sections">
        {customOnlyTVShows.length > 0 && (
          <VerticalMovieRow
            title="Admin TV Picks"
            customData={customOnlyTVShows}
            onMovieClick={setSelectedMovie}
            accentColor="#4cd137"
            badge="Admin Choice"
          />
        )}
        <VerticalMovieRow
          title="Trending Series"
          fetchFn={getTVShows}
          onMovieClick={setSelectedMovie}
        />

        <div className="tv-divider">
          <span className="tv-divider-label">🇮🇳 Indian Originals</span>
        </div>

        <VerticalMovieRow
          title="Bollywood Web Series"
          fetchFn={getBollywoodTVShows}
          onMovieClick={setSelectedMovie}
          accentColor="#ff6b35"
          badge="Desi Picks"
        />
      </div>

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
}
