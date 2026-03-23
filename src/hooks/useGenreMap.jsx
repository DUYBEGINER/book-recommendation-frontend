import { useMemo } from "react";
import useGenres from "./useGenres";

/**
 * Custom hook that provides O(1) genre lookup by ID
 * Converts genres array to a Map for efficient lookups
 *
 * @returns {Object} - { genreMap: Map<genreId, genre>, genres: Array, isLoading: boolean }
 *
 * @example
 * const { genreMap } = useGenreMap();
 * const genre = genreMap.get(11); // O(1) lookup instead of O(n) find
 */
const useGenreMap = () => {
  const { genres, isLoading } = useGenres();

  // Memoize the Map to avoid recreating it on every render
  const genreMap = useMemo(() => {
    const map = new Map();
    genres.forEach((genre) => {
      map.set(genre.genreId, genre);
    });
    return map;
  }, [genres]);

  return {
    genreMap,
    genres,
    isLoading,
  };
};

export default useGenreMap;
