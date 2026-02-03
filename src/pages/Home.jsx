import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import BookCarousel from "../components/BookCarousel";
import TopBooksShowcase from "../components/TopBooksShowcase";
import ThemeToggle from "../components/ThemeToggle";
import MainLayout from "../layout/MainLayout";
import { getBooksByGenre } from "../services/manageBookService";
import { getMostReadBooks } from "../services/bookService";
import useAuth from "../hook/useAuth";

const DEFAULT_PAGE_SIZE = 12;
const TOP_BOOKS_SIZE = 4;

// Genre configuration - centralized and reusable
const GENRE_CONFIG = [
  { id: 11, name: "Tài chính", title: "TÀI CHÍNH" },
  { id: 6, name: "Kỹ năng sống", title: "KỸ NĂNG SỐNG" },
  { id: 9, name: "Tiểu thuyết", title: "TIỂU THUYẾT" },
];

const Home = () => {
  const navigate = useNavigate();
  const [genreBooks, setGenreBooks] = useState({});
  const [genreLoaded, setGenreLoaded] = useState({});
  const [topBooks, setTopBooks] = useState([]);
  const [topBooksLoading, setTopBooksLoading] = useState(true);
  const [error, setError] = useState(null);

  // Note: useAuth hook available for future user-specific features
  const _auth = useAuth();
  
  // Refs for intersection observer - use single object
  const genreRefs = useRef({});
  const loadedGenresRef = useRef(new Set());

  // Load top books (most read)
  useEffect(() => {
    const controller = new AbortController();
    
    const loadTopBooks = async () => {
      try {
        const response = await getMostReadBooks(0, TOP_BOOKS_SIZE);
        if (!controller.signal.aborted) {
          setTopBooks(Array.isArray(response?.data) ? response.data : []);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Error loading top books:", err);
          setError("Không thể tải sách nổi bật");
        }
      } finally {
        if (!controller.signal.aborted) {
          setTopBooksLoading(false);
        }
      }
    };
    
    loadTopBooks();
    return () => controller.abort();
  }, []);

  // Load books by genre - optimized with single state update
  const loadGenreBooks = useCallback(async (genreId) => {
    try {
      const response = await getBooksByGenre(genreId, { page: 0, size: DEFAULT_PAGE_SIZE });
      const books = Array.isArray(response?.data) ? response.data : [];
      
      setGenreBooks(prev => ({ ...prev, [genreId]: books }));
    } catch (err) {
      console.error(`Error loading genre ${genreId}:`, err);
      setGenreBooks(prev => ({ ...prev, [genreId]: [] }));
    }
  }, []);

  // Intersection Observer for lazy loading - simplified
  useEffect(() => {
    if (topBooksLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          
          const genreId = Number(entry.target.dataset.genreId);
          if (loadedGenresRef.current.has(genreId)) return;
          
          loadedGenresRef.current.add(genreId);
          setGenreLoaded(prev => ({ ...prev, [genreId]: true }));
          loadGenreBooks(genreId);
        });
      },
      { root: null, rootMargin: "100px", threshold: 0.1 }
    );

    // Observe all genre refs
    Object.values(genreRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [topBooksLoading, loadGenreBooks]);

  // Ref callback for genre sections
  const setGenreRef = useCallback((genreId) => (el) => {
    genreRefs.current[genreId] = el;
  }, []);

  const handleSearchSubmit = useCallback((keyword) => {
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword) {
      navigate(`/search?keyword=${encodeURIComponent(trimmedKeyword)}`);
    }
  }, [navigate]);

  // Memoized genre sections to prevent re-renders
  const genreSections = useMemo(() => (
    GENRE_CONFIG.map((genre) => {
      const books = genreBooks[genre.id];
      const isLoaded = genreLoaded[genre.id];

      return (
        <div 
          key={genre.id} 
          ref={setGenreRef(genre.id)} 
          data-genre-id={genre.id}
          className="min-h-[100px]"
        >
          {isLoaded ? (
            books?.length > 0 ? (
              <BookCarousel 
                books={books} 
                title={genre.title} 
                genreId={genre.id}
                genreName={genre.name}
                subtitle={true}
              />
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Không có sách thể loại {genre.name}
                </p>
              </div>
            )
          ) : (
            <div className="py-16 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Đang tải thể loại {genre.name}...
              </p>
            </div>
          )}
        </div>
      );
    })
  ), [genreBooks, genreLoaded, setGenreRef]);

  return (
    <MainLayout
      showHero={true}
      heroContent={<Hero />}
      onSearchSubmit={handleSearchSubmit}
    >
      <ThemeToggle />
      <main className="mt-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {topBooksLoading && (
          <div className="py-16 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            <p className="mt-4 text-gray-600 dark:text-gray-300">Đang tải sách...</p>
          </div>
        )}

        {error && (
          <div className="py-8 text-center bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl">
            <p className="text-red-600 dark:text-red-300 font-medium">{error}</p>
          </div>
        )}

        {!topBooksLoading && !error && (
          <>
            {/* Top Books Showcase - Most Read Books */}
            {topBooks.length > 0 && (
              <TopBooksShowcase 
                books={topBooks} 
                title="Top sách được đọc nhiều nhất" 
              />
            )}

            {/* Genre Carousels - Lazy Loaded */}
            {genreSections}
          </>
        )}
      </main>
    </MainLayout>
  );
};

export default React.memo(Home);
