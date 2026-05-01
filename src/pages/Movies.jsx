import { useState } from 'react';
import MovieRow from '../components/MovieRow';
import { getPopular, getTopRated, getNowPlaying, getBollywoodLatest } from '../api/imdb';
import MovieModal from '../components/MovieModal';
import { useCustomMovies } from '../context/CustomMoviesContext';

export default function Movies() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const { customMovies } = useCustomMovies();
  const customOnlyMovies = customMovies.filter(m => m.type === 'movie');

  return (
    <div className="page-movies" style={{ paddingTop: '80px', minHeight: '100vh' }}>
      <h1 style={{ padding: '20px 40px', color: 'white', fontSize: '2.5rem', fontWeight: 600 }}>Movies Collection</h1>
      <div className="movie-rows-container" style={{ marginTop: '1rem' }}>
        {customOnlyMovies.length > 0 && (
          <MovieRow title="Admin Movie Picks" customData={customOnlyMovies} onMovieClick={setSelectedMovie} />
        )}
        <MovieRow title="Hollywood Blockbusters" fetchFn={getNowPlaying} onMovieClick={setSelectedMovie} />
        <MovieRow title="Bollywood Hits" fetchFn={getBollywoodLatest} onMovieClick={setSelectedMovie} />
        <MovieRow title="Popular Movies" fetchFn={getPopular} onMovieClick={setSelectedMovie} />
        <MovieRow title="Top Rated Movies" fetchFn={getTopRated} onMovieClick={setSelectedMovie} />
      </div>

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
}
