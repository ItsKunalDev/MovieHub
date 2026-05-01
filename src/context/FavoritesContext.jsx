import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { requireAuth } = useAuth();
  const [favorites, setFavorites] = useState([]);

  const addToFavorites = useCallback(
    (movie) => {
      requireAuth(() => {
        setFavorites((prev) =>
          prev.find((m) => m.id === movie.id) ? prev : [...prev, movie]
        );
      });
    },
    [requireAuth]
  );

  const removeFromFavorites = useCallback((movieId) => {
    setFavorites((prev) => prev.filter((m) => m.id !== movieId));
  }, []);

  const isInFavorites = useCallback(
    (movieId) => favorites.some((m) => m.id === movieId),
    [favorites]
  );

  return (
    <FavoritesContext.Provider
      value={{ favorites, addToFavorites, removeFromFavorites, isInFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
