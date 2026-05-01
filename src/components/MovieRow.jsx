import { useRef, useEffect, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import MovieCard from './MovieCard';
import SkeletonCard from './SkeletonCard';
import './MovieRow.css';

export default function MovieRow({ title, fetchFn, customData, onMovieClick }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    let cancelled = false;
    
    if (customData) {
      setMovies(customData);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    fetchFn()
      .then(({ data }) => {
        if (!cancelled) setMovies(data.results || []);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load movies.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [fetchFn]);

  const checkScroll = () => {
    const el = rowRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  const scroll = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 600, behavior: 'smooth' });
    setTimeout(checkScroll, 500);
  };

  return (
    <section className="movie-row">
      <div className="row-header">
        <h2 className="row-title">{title}</h2>
        <div className="row-controls">
          <button
            className={`row-arrow ${!canScrollLeft ? 'hidden' : ''}`}
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
          >
            <FiChevronLeft />
          </button>
          <button
            className={`row-arrow ${!canScrollRight ? 'hidden' : ''}`}
            onClick={() => scroll(1)}
            aria-label="Scroll right"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      {error && <p className="row-error">{error}</p>}

      <div className="row-scroll" ref={rowRef} onScroll={checkScroll}>
        {loading
          ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
          : movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onClick={onMovieClick} />
            ))}
      </div>
    </section>
  );
}
