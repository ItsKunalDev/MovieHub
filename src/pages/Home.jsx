import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import MovieRow from '../components/MovieRow';
import MovieModal from '../components/MovieModal';
import { getTrending, getPopular, getTopRated, getNowPlaying, getBollywoodLatest } from '../api/imdb';
import { useCustomMovies } from '../context/CustomMoviesContext';

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const { customMovies } = useCustomMovies();

  useEffect(() => {
    getTrending().then(({ data }) => setTrending(data.results || []));
  }, []);

  return (
    <div className="page-home">
      <Hero movies={trending} onInfoClick={setSelectedMovie} />

      <div className="movie-rows-container">
        {customMovies.length > 0 && (
          <MovieRow
            title="Custom Picks"
            customData={customMovies}
            onMovieClick={setSelectedMovie}
          />
        )}
        <MovieRow
          title="Trending Now"
          fetchFn={getTrending}
          onMovieClick={setSelectedMovie}
        />
        <MovieRow
          title="Popular Movies"
          fetchFn={getPopular}
          onMovieClick={setSelectedMovie}
        />
        <MovieRow
          title="Top Rated"
          fetchFn={getTopRated}
          onMovieClick={setSelectedMovie}
        />
        
        <MovieRow
          title="Bollywood Hits (2012-2026)"
          fetchFn={getBollywoodLatest}
          onMovieClick={setSelectedMovie}
        />

        <MovieRow
          title="Hollywood Blockbusters"
          fetchFn={getNowPlaying}
          onMovieClick={setSelectedMovie}
        />
      </div>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}
