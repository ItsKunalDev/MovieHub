import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const { requireAuth } = useAuth();
  const [watchlist, setWatchlist] = useState([]);

  const addToWatchlist = useCallback(
    (movie) => {
      requireAuth(() => {
        setWatchlist((prev) =>
          prev.find((m) => m.id === movie.id) ? prev : [...prev, movie]
        );
      });
    },
    [requireAuth]
  );

  const removeFromWatchlist = useCallback((movieId) => {
    setWatchlist((prev) => prev.filter((m) => m.id !== movieId));
  }, []);

  const isInWatchlist = useCallback(
    (movieId) => watchlist.some((m) => m.id === movieId),
    [watchlist]
  );

  return (
    <WatchlistContext.Provider
      value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export const useWatchlist = () => useContext(WatchlistContext);
