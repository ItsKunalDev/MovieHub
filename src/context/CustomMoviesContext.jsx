import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const CustomMoviesContext = createContext(null);

export function CustomMoviesProvider({ children }) {
  const [customMovies, setCustomMovies] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "movies"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const movies = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        movies.push({ 
          id: doc.id,
          title: data.title,
          overview: data.description,
          poster_path: data.thumbnailURL,
          backdrop_path: data.thumbnailURL,
          video_url: data.videoURL,
          vote_average: data.imdbRating ? Number(data.imdbRating) : 0,
          category: 'Hollywood', // Default category for legacy UI structure
          type: 'movie',         // Default type for legacy UI structure
          isCustom: true,
          ...data 
        });
      });
      setCustomMovies(movies);
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <CustomMoviesContext.Provider value={{ customMovies }}>
      {children}
    </CustomMoviesContext.Provider>
  );
}

export const useCustomMovies = () => useContext(CustomMoviesContext);
