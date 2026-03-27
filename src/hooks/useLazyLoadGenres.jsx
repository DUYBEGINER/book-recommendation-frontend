import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getBooksByGenre } from "../services/manageBookService";
import { useQueries } from "@tanstack/react-query";
const DEFAULT_PAGE_SIZE = 12;

/**
 * Custom hook for lazy loading genre books using Intersection Observer
 *
 * @param {Array<number>} genreIds - Array of genre IDs to lazy load
 * @param {Object} options - Configuration options
 * @param {number} options.pageSize - Books per genre (default: 12)
 * @param {string} options.rootMargin - Intersection Observer root margin (default: "100px")
 * @param {number} options.threshold - Intersection Observer threshold (default: 0.1)
 * @param {boolean} options.enabled - Enable lazy loading (default: true)
 *
 * @returns {Object} - { genreBooks, genreLoaded, setGenreRef, loadGenreBooks }
 *
 * @example
 * const genreIds = [11, 6, 9];
 * const { genreBooks, genreLoaded, setGenreRef } = useLazyLoadGenres(genreIds);
 *
 * // In render:
 * <div ref={setGenreRef(11)} data-genre-id={11}>
 *   {genreLoaded[11] && <BookList books={genreBooks[11]} />}
 * </div>
 */
const useLazyLoadGenres = (
  {
    pageSize = DEFAULT_PAGE_SIZE,
    rootMargin = "100px",
    threshold = 0.1,
    enabled = true,
  } = {}
) => {

  const [intersectedGenres, setIntersectedGenres] = useState([]);

  const genreRefs = useRef({});
  const observerRef = useRef(null);

  // Load books by genre
 
  // Setup Intersection Observer
  useEffect(() => {
    if (!enabled) return;

    if (observerRef.current) observerRef.current.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const genreId = Number(entry.target.dataset.genreId);
          if (!genreId) return;

          // When a genre section intersects, mark it as loaded and fetch books
          setIntersectedGenres((prev) => {
            if (prev.includes(genreId)) return prev;
            return [...prev, genreId];
          });
        });
      },
      { root: null, rootMargin, threshold }
    );

    observerRef.current = observer;

    // Observe các element đã được gán ref
    Object.values(genreRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [enabled, rootMargin, threshold]);

  const setGenreRef = useCallback(
    (genreId) => (el) => {
      genreRefs.current[genreId] = el;
      if (el && observerRef.current) {
        observerRef.current.observe(el);
      }
    },
    []
  );

  const genreQueries = useQueries({
    queries: intersectedGenres.map((genreId) => ({
      queryKey: ["genreBooks", genreId],
      queryFn: () => getBooksByGenre(genreId, { page: 0, size: pageSize }),
    })),
  });

  const genreBooks = useMemo(() => {
    const booksMap = {};
    intersectedGenres.forEach((genreId, index) => {
      const query = genreQueries[index];
      // Nếu đang trong trạng thái loading/pending, gán undefined để UI render Skeleton
      if (query?.isLoading || query?.isPending) {
        booksMap[genreId] = undefined;
      } else {
        const response = query?.data;
        booksMap[genreId] = Array.isArray(response?.content) ? response.content : [];
      }
    });
    return booksMap;
  }, [intersectedGenres, genreQueries]);

  const genreLoaded = useMemo(() => {
    const loadedMap = {};
    intersectedGenres.forEach((genreId, index) => {
      // Coi như đã load xong khi call API thành công hoặc bị lỗi (để tắt spinner)
      loadedMap[genreId] = genreQueries[index]?.isSuccess || genreQueries[index]?.isError;
    });
    return loadedMap;
  }, [intersectedGenres, genreQueries]);

  return {
    genreBooks,
    genreLoaded,
    setGenreRef,
  };
};

export default useLazyLoadGenres;
