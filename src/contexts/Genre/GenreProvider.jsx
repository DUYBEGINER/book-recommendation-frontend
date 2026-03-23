import React, { useState, useEffect } from "react";
import { getAllGenres } from "../../services/genreService";
import { GenreContext } from "./GenreContext";
import { getCache, setCache } from "../../utils/cache.utils";

const GENRES_CACHE_KEY = "genres_cache_v1";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export const GenreProvider = ({ children }) => {
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      // Try to get from cache first
      const cachedGenres = getCache(GENRES_CACHE_KEY);

      if (cachedGenres) {
        setGenres(cachedGenres);
        setIsLoading(false);
        return;
      }

      // If no cache, fetch from API
      try {
        const data = await getAllGenres();
        const genresList = data || [];
        setGenres(genresList);

        // Cache the result
        setCache(GENRES_CACHE_KEY, genresList, CACHE_TTL);
      } catch (error) {
        console.error("Lỗi khi tải danh sách thể loại:", error);
        setGenres([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenres();
  }, []);

  return (
    <GenreContext.Provider value={{ genres, isLoading }}>
      {children}
    </GenreContext.Provider>
  );
};
