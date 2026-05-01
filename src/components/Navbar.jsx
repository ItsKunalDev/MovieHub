import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiMenu, FiBookmark, FiLogOut, FiUser, FiMessageCircle } from 'react-icons/fi';
import { MdLocalMovies } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { searchMovies, getImageUrl } from '../api/imdb';
import UserChat from './UserChat';
import './Navbar.css';

export default function Navbar({ onMovieSelect }) {
  const { user, logout, setShowAuthModal } = useAuth();
  const { watchlist } = useWatchlist();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    let timeoutId;
    if (userDropdownOpen) {
      timeoutId = setTimeout(() => {
        setUserDropdownOpen(false);
      }, 150000); // 2.5 minutes
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [userDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    const handleScroll = () => {
      if (userDropdownOpen) setUserDropdownOpen(false);
    };

    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [userDropdownOpen]);

  const handleSearch = useCallback((val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); return; }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await searchMovies(val);
        setResults(data.results.slice(0, 6));
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 400);
  }, []);

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
    setResults([]);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="nav-logo" onClick={() => setMenuOpen(false)}>
          <MdLocalMovies className="logo-icon" />
          <span>MovieHub</span>
        </Link>

        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link to="/movies" onClick={() => setMenuOpen(false)}>Movies</Link></li>
          <li><Link to="/tv" onClick={() => setMenuOpen(false)}>TV Shows</Link></li>
        </ul>

        <div className="nav-actions">
          <div className={`search-wrapper ${searchOpen ? 'expanded' : ''}`}>
            {searchOpen ? (
              <>
                <FiSearch className="search-icon-inside" />
                <input
                  ref={searchRef}
                  className="search-input"
                  placeholder="Search movies..."
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                <button className="icon-btn" onClick={closeSearch}><FiX /></button>
                {(results.length > 0 || searching) && (
                  <div className="search-dropdown">
                    {searching && <div className="search-loading">Searching…</div>}
                    {results.map((m) => (
                      <button
                        key={m.id}
                        className="search-result-item"
                        onClick={() => { onMovieSelect(m); closeSearch(); }}
                      >
                        <img
                          src={m.poster_path
                            ? getImageUrl(m.poster_path)
                            : '/no-image.png'}
                          alt={m.title}
                        />
                        <div>
                          <span className="result-title">{m.title}</span>
                          <span className="result-year">
                            {m.release_date?.slice(0, 4)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <button className="icon-btn" onClick={() => setSearchOpen(true)}
                aria-label="Open search">
                <FiSearch />
              </button>
            )}
          </div>

          {user ? (
            <div className="user-menu" ref={userMenuRef}>
              <div className="user-avatar" onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
                {user.photoURL
                  ? <img src={user.photoURL} alt={user.name} className="user-avatar-img" referrerPolicy="no-referrer" />
                  : (user.displayName || user.name || 'U')[0].toUpperCase()
                }
              </div>
              <div className={`user-dropdown ${userDropdownOpen ? 'open' : ''}`}>
                <div className="user-dropdown-header">
                  <span className="user-name">{user.displayName || user.name || 'User'}</span>
                  <span className="user-email">{user.email}</span>
                </div>
                <button className="dropdown-item" onClick={() => { navigate('/profile', { state: { tab: 'details' } }); setMenuOpen(false); setUserDropdownOpen(false); }}>
                  <FiUser /> Profile
                </button>
                <button className="dropdown-item" onClick={() => { navigate('/profile', { state: { tab: 'watchlist' } }); setMenuOpen(false); setUserDropdownOpen(false); }}>
                  <FiBookmark /> Watchlist
                  {watchlist.length > 0 && (
                    <span className="badge">{watchlist.length}</span>
                  )}
                </button>
                <button className="dropdown-item logout" onClick={async () => { await logout(); setMenuOpen(false); setUserDropdownOpen(false); navigate('/'); }}>
                  <FiLogOut /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button className="btn-signin" onClick={() => setShowAuthModal(true)}>
              Sign In
            </button>
          )}

          <div style={{ position: 'relative' }}>
            <button 
              className="icon-btn" 
              onClick={() => { setChatOpen(!chatOpen); setUserDropdownOpen(false); }}
              aria-label="Toggle Chat"
            >
              <FiMessageCircle />
            </button>
            <UserChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
          </div>

          <button
            className="hamburger icon-btn"
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
}
