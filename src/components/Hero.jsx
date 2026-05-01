import { useState, useEffect } from 'react';
import { FiPlay, FiInfo } from 'react-icons/fi';
import { getBackdropUrl } from '../api/imdb';
import './Hero.css';

export default function Hero({ movies = [], onInfoClick }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [fading, setFading] = useState(false);

  const featured = movies[activeIdx];

  useEffect(() => {
    if (movies.length <= 1) return;
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActiveIdx((i) => (i + 1) % Math.min(movies.length, 5));
        setFading(false);
      }, 500);
    }, 8000);
    return () => clearInterval(timer);
  }, [movies]);

  if (!featured) {
    return (
      <div className="hero hero-skeleton">
        <div className="hero-shimmer" />
      </div>
    );
  }

  const backdrop = getBackdropUrl(featured.backdrop_path, 'original');
  const overview = featured.overview?.length > 180
    ? featured.overview.slice(0, 180) + '…'
    : featured.overview;

  return (
    <section className={`hero ${fading ? 'fading' : ''}`}>
      <div
        className="hero-bg"
        style={{ backgroundImage: backdrop ? `url(${backdrop})` : 'none' }}
      />
      <div className="hero-overlay" />

      <div className="hero-content">
        <div className="hero-meta">
          <span className="hero-tag">Featured</span>
          {featured.vote_average > 0 && (
            <span className="hero-rating">
              ⭐ {featured.vote_average.toFixed(1)}
            </span>
          )}
          {featured.release_date && (
            <span className="hero-year">{featured.release_date.slice(0, 4)}</span>
          )}
        </div>

        <h1 className="hero-title">
          {featured.title || featured.name}
        </h1>

        {overview && <p className="hero-overview">{overview}</p>}

        <div className="hero-actions">
          <button className="hero-btn primary" id="hero-watch-btn">
            <FiPlay /> Watch Now
          </button>
          <button
            className="hero-btn secondary"
            id="hero-info-btn"
            onClick={() => onInfoClick(featured)}
          >
            <FiInfo /> More Info
          </button>
        </div>
      </div>

      {movies.length > 1 && (
        <div className="hero-dots">
          {movies.slice(0, 5).map((_, i) => (
            <button
              key={i}
              className={`dot ${i === activeIdx ? 'active' : ''}`}
              onClick={() => { setFading(true); setTimeout(() => { setActiveIdx(i); setFading(false); }, 300); }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
