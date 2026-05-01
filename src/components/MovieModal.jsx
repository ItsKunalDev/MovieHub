import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiStar, FiCalendar, FiBookmark, FiCheck, FiPlay, FiPause, FiMonitor, FiDownload, FiHeart, FiVolume2, FiVolumeX, FiMaximize, FiMinimize } from 'react-icons/fi';
import { getMovieDetails, getImageUrl, getBackdropUrl, LOCAL_VIDEOS } from '../api/imdb';
import { useWatchlist } from '../context/WatchlistContext';
import { useFavorites } from '../context/FavoritesContext';
import './MovieModal.css';

export default function MovieModal({ movie, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watchClicked, setWatchClicked] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [downloadClicked, setDownloadClicked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { addToFavorites, removeFromFavorites, isInFavorites } = useFavorites();
  const inWatchlist = isInWatchlist(movie.id);
  const inFavs = isInFavorites(movie.id);
  const localVideo = movie.video_url || LOCAL_VIDEOS[movie.id] || null;

  const fmtTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return h > 0
      ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
      : `${m}:${String(sec).padStart(2,'0')}`;
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setIsPlaying(true); }
    else          { v.pause(); setIsPlaying(false); }
  };

  const skipTime = (sec) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + sec));
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const handleSeek = (e) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    v.currentTime = ratio * v.duration;
  };

  const handleFullscreen = () => {
    const el = playerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleWatchNow = () => {
    if (localVideo) {
      setShowPlayer(true);
    } else {
      setWatchClicked(true);
      setTimeout(() => setWatchClicked(false), 2000);
    }
  };

  const handleDownload = () => {
    if (localVideo) {
      const a = document.createElement('a');
      a.href = localVideo;
      a.download = '';
      a.click();
    } else {
      setDownloadClicked(true);
      setTimeout(() => setDownloadClicked(false), 2000);
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    getMovieDetails(movie.id)
      .then(({ data }) => setDetails(data))
      .catch(() => setDetails(null))
      .finally(() => setLoading(false));
    return () => { document.body.style.overflow = ''; };
  }, [movie.id]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const data = details || movie;
  const backdrop = getBackdropUrl(data.backdrop_path, 'w1280');
  const poster = getImageUrl(data.poster_path, 'w342');
  const genres = details?.genres?.slice(0, 4) || [];
  const runtime = details?.runtime;
  const trailer = details?.videos?.results?.find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube'
  );

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={data.title || data.name}
      >
        {/* Hero backdrop */}
        <div className="modal-backdrop-img">
          {backdrop && <img src={backdrop} alt="" />}
          <div className="modal-backdrop-overlay" />
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          {/* Poster */}
          <div className="modal-poster">
            {poster
              ? <img src={poster} alt={data.title} />
              : <div className="modal-no-poster">{data.title?.[0]}</div>
            }
          </div>

          {/* Info */}
          <div className="modal-info">
            {loading && <div className="modal-loading">
              <div className="modal-spinner" />
            </div>}

            <h2 className="modal-title">{data.title || data.name}</h2>

            <div className="modal-meta">
              {data.vote_average > 0 && (
                <span className="meta-chip rating">
                  <FiStar /> {data.vote_average?.toFixed(1)}
                </span>
              )}
              {(data.release_date || data.first_air_date) && (
                <span className="meta-chip">
                  <FiCalendar />
                  {(data.release_date || data.first_air_date)?.slice(0, 4)}
                </span>
              )}
              {runtime > 0 && (
                <span className="meta-chip">
                  {Math.floor(runtime / 60)}h {runtime % 60}m
                </span>
              )}
            </div>

            {genres.length > 0 && (
              <div className="modal-genres">
                {genres.map((g) => (
                  <span key={g.id} className="genre-tag">{g.name}</span>
                ))}
              </div>
            )}

            {data.overview && (
              <p className="modal-overview">{data.overview}</p>
            )}

            <div className="modal-actions">
              <button
                className={`modal-btn watch-now${watchClicked ? ' watch-now--active' : ''}`}
                id="watch-now-btn"
                onClick={handleWatchNow}
              >
                <FiMonitor /> {watchClicked ? 'Coming Soon…' : 'Watch Now'}
              </button>
              <button
                className={`modal-btn modal-btn-download${downloadClicked && !localVideo ? ' download--unavailable' : ''}`}
                id="download-video-btn"
                onClick={handleDownload}
                title={localVideo ? 'Download video' : 'Download not available'}
              >
                <FiDownload />
                {downloadClicked && !localVideo ? 'Not Available' : 'Download'}
              </button>
              {trailer && (
                <button
                  className="modal-btn secondary"
                  onClick={() =>
                    window.open(
                      `https://youtube.com/watch?v=${trailer.key}`,
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }
                >
                  <FiPlay /> Watch Trailer
                </button>
              )}
              <button
                className={`modal-btn ${inWatchlist ? 'in-list' : 'secondary'}`}
                onClick={() => inWatchlist
                  ? removeFromWatchlist(movie.id)
                  : addToWatchlist(movie)
                }
              >
                {inWatchlist ? <><FiCheck /> Watch Later</> : <><FiBookmark /> Watch Later</>}
              </button>
              <button
                className={`modal-btn ${inFavs ? 'in-list' : 'secondary'}`}
                onClick={() => inFavs
                  ? removeFromFavorites(movie.id)
                  : addToFavorites(movie)
                }
              >
                {inFavs ? <><FiHeart fill="currentColor" /> Favorited</> : <><FiHeart /> Favorite</>}
              </button>
            </div>

            {/* Inline video player */}
            {showPlayer && localVideo && (
              <div className="modal-video-player" ref={playerRef} data-fs={isFullscreen ? 'true' : undefined}>
                <div className="modal-video-header">
                  <span>🎬 Now Playing: {data.title || data.name}</span>
                  <div className="modal-video-actions">
                    <a
                      href={localVideo}
                      download
                      className="modal-video-download"
                      title="Download video"
                    >
                      ⬇ Download
                    </a>
                    <button className="modal-video-close" onClick={() => setShowPlayer(false)} aria-label="Close player">✕</button>
                  </div>
                </div>

                {/* Video element — no native controls */}
                <video
                  ref={videoRef}
                  className="modal-video"
                  src={localVideo}
                  autoPlay
                  preload="metadata"
                  onClick={togglePlay}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={() => {
                    const v = videoRef.current;
                    if (!v) return;
                    setCurrentTime(v.currentTime);
                    setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
                  }}
                  onLoadedMetadata={() => {
                    const v = videoRef.current;
                    if (v) setDuration(v.duration);
                  }}
                >
                  Your browser does not support the video tag.
                </video>

                {/* Custom controls */}
                <div className="mvc-controls">
                  {/* Seek bar */}
                  <div className="mvc-seek" onClick={handleSeek} title="Seek">
                    <div className="mvc-seek-fill" style={{ width: `${progress}%` }} />
                  </div>

                  <div className="mvc-row">
                    {/* Left: skip-back / play-pause / skip-forward */}
                    <div className="mvc-left">
                      <button
                        className="mvc-btn mvc-skip"
                        onClick={() => skipTime(-600)}
                        title="Back 10 min"
                        aria-label="Rewind 10 minutes"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1 4 1 10 7 10"/>
                          <path d="M3.51 15a9 9 0 1 0 .49-4"/>
                        </svg>
                        <span>10</span>
                      </button>

                      <button
                        className="mvc-btn mvc-play"
                        onClick={togglePlay}
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <FiPause /> : <FiPlay />}
                      </button>

                      <button
                        className="mvc-btn mvc-skip"
                        onClick={() => skipTime(600)}
                        title="Forward 10 min"
                        aria-label="Forward 10 minutes"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="23 4 23 10 17 10"/>
                          <path d="M20.49 15a9 9 0 1 1-.49-4"/>
                        </svg>
                        <span>10</span>
                      </button>

                      <span className="mvc-time">{fmtTime(currentTime)} / {fmtTime(duration)}</span>
                    </div>

                    {/* Right: mute + fullscreen */}
                    <div className="mvc-right">
                      <button
                        className="mvc-btn"
                        onClick={toggleMute}
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? <FiVolumeX /> : <FiVolume2 />}
                      </button>
                      <button
                        className="mvc-btn"
                        onClick={handleFullscreen}
                        aria-label="Fullscreen"
                      >
                        {isFullscreen ? <FiMinimize /> : <FiMaximize />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {details?.credits?.cast?.length > 0 && (
              <div className="modal-cast">
                <h4>Cast</h4>
                <div className="cast-list">
                  {details.credits.cast.slice(0, 6).map((c) => (
                    <div key={c.id} className="cast-item">
                      <div className="cast-avatar">
                        {c.profile_path
                          ? <img src={getImageUrl(c.profile_path, 'w92')} alt={c.name} loading="lazy" />
                          : <span>{c.name[0]}</span>
                        }
                      </div>
                      <span className="cast-name">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
