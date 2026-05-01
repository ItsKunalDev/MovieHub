import { useEffect, useState } from 'react';
import { FiStar, FiEye } from 'react-icons/fi';
import { getImageUrl } from '../api/imdb';
import SkeletonCard from './SkeletonCard';
import './VerticalMovieRow.css';

function VerticalCard({ movie, onClick }) {
  const [imgError, setImgError] = useState(false);
  const poster = getImageUrl(movie.poster_path, 'w342');
  const rating = movie.vote_average?.toFixed(1);
  const year = movie.release_date?.slice(0, 4) || movie.first_air_date?.slice(0, 4);

  if (!poster || imgError) return null;

  return (
    <div className="v-card" onClick={() => onClick(movie)} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(movie)}>
      <div className="v-card-poster-wrap">
        <img
          className="v-card-poster"
          src={poster}
          alt={movie.title || movie.name}
          loading="lazy"
          onError={() => setImgError(true)}
        />
        <div className="v-card-overlay">
          <button className="v-view-btn" aria-label="View details">
            <FiEye /> View Details
          </button>
        </div>
        {rating && (
          <div className="v-card-rating">
            <FiStar className="v-star-icon" />
            <span>{rating}</span>
          </div>
        )}
      </div>
      <div className="v-card-info">
        <p className="v-card-title">{movie.title || movie.name}</p>
        {year && <span className="v-card-year">{year}</span>}
      </div>
    </div>
  );
}

export default function VerticalMovieRow({ title, fetchFn, customData, onMovieClick, accentColor, badge }) {
  const [movies, setMovies] = useState(customData || []);
  const [loading, setLoading] = useState(!customData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (customData) {
      setMovies(customData);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchFn()
      .then(({ data }) => {
        if (!cancelled) setMovies(data.results || []);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load shows.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [fetchFn, customData]);

  return (
    <section className="v-movie-row">
      <div className="v-row-header">
        <div className="v-row-title-group">
          <h2 className="v-row-title" style={accentColor ? { '--row-accent': accentColor } : {}}>
            {title}
          </h2>
          {badge && <span className="v-row-badge">{badge}</span>}
        </div>
        <span className="v-row-count">{!loading && `${movies.length} shows`}</span>
      </div>

      {error && <p className="v-row-error">{error}</p>}

      <div className="v-grid">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
          : movies.map((movie) => (
              <VerticalCard key={movie.id} movie={movie} onClick={onMovieClick} />
            ))}
      </div>
    </section>
  );
}
