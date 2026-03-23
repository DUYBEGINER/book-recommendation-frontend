import { useState, useEffect, useRef, useCallback } from "react";
import { getBooksByGenre } from "../services/manageBookService";

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
  genreIds = [],
  {
    pageSize = DEFAULT_PAGE_SIZE,
    rootMargin = "100px",
    threshold = 0.1,
    enabled = true,
  } = {}
) => {
  const [genreBooks, setGenreBooks] = useState({});
  const [genreLoaded, setGenreLoaded] = useState({});

  const genreRefs = useRef({});
  const loadedGenresRef = useRef(new Set());
  const observerRef = useRef(null);

  // Load books by genre
  const loadGenreBooks = useCallback(
    async (genreId) => {
      try {
        const response = await getBooksByGenre(genreId, {
          page: 0,
          size: pageSize,
        });
        const books = Array.isArray(response?.content) ? response.content : [];

        setGenreBooks((prev) => ({ ...prev, [genreId]: books }));
      } catch (err) {
        console.error(`Error loading genre ${genreId}:`, err);
        setGenreBooks((prev) => ({ ...prev, [genreId]: [] }));
      }
    },
    [pageSize]
  );

  // Ref callback for genre sections
  const setGenreRef = useCallback(
    (genreId) => (el) => {
      genreRefs.current[genreId] = el;
    },
    []
  );

  // Setup Intersection Observer
  useEffect(() => {
    if (!enabled) return;

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const genreId = Number(entry.target.dataset.genreId);
          if (!genreId || loadedGenresRef.current.has(genreId)) return;

          loadedGenresRef.current.add(genreId);
          setGenreLoaded((prev) => ({ ...prev, [genreId]: true }));
          loadGenreBooks(genreId);
        });
      },
      { root: null, rootMargin, threshold }
    );

    observerRef.current = observer;

    // Observe all genre refs
    Object.values(genreRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [enabled, rootMargin, threshold, loadGenreBooks]);

  return {
    genreBooks,
    genreLoaded,
    setGenreRef,
    loadGenreBooks,
  };
};

export default useLazyLoadGenres;
