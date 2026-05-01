import { useState } from 'react';
import { FiStar, FiEye } from 'react-icons/fi';
import { getImageUrl } from '../api/imdb';
import './MovieCard.css';

export default function MovieCard({ movie, onClick }) {
  const [imgError, setImgError] = useState(false);
  const poster = getImageUrl(movie.poster_path, 'w342');
  const rating = movie.vote_average?.toFixed(1);
  const year = movie.release_date?.slice(0, 4) || movie.first_air_date?.slice(0, 4);

  if (!poster || imgError) return null;

  return (
    <div className="movie-card" onClick={() => onClick(movie)} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(movie)}>
      <div className="card-poster-wrap">
        <img
          className="card-poster"
          src={poster}
          alt={movie.title || movie.name}
          loading="lazy"
          onError={() => setImgError(true)}
        />

        <div className="card-overlay">
          <button className="view-btn" aria-label="View details">
            <FiEye /> View Details
          </button>
        </div>

        {rating && (
          <div className="card-rating">
            <FiStar className="star-icon" />
            <span>{rating}</span>
          </div>
        )}
      </div>

      <div className="card-info">
        <p className="card-title">{movie.title || movie.name}</p>
        {year && <span className="card-year">{year}</span>}
      </div>
    </div>
  );
}
