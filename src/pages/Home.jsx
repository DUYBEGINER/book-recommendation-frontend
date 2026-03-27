import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Components
import Hero from "../components/home/Hero";
import BookCarousel from "../components/common/BookCarousel";
import TopBooksShowcase, { TopBooksSkeleton } from "../components/home/TopBooksShowcase";
import GenreShowcase from "../components/home/GenreShowcase";
import SideTitleBookCarousel from "../components/home/SideTitleBookCarousel";

// Layout
import MainLayout from "../layouts/MainLayout";

// Hooks
import useGenreMap from "../hooks/useGenreMap";
import useTopBooks from "../hooks/useTopBooks";
import useLazyLoadGenres from "../hooks/useLazyLoadGenres";

// Constants
import {
  MAIN_GENRE_CONFIG,
  SIDE_GENRE_CONFIG,
  TOP_BOOKS_SIZE,
} from "../constants/homeGenres";

const Home = () => {
  const navigate = useNavigate();

  // Get genres with O(1) lookup map
  const { genreMap } = useGenreMap();

  // Load top books
  const {
    topBooks,
    loading: topBooksLoading,
    error,
  } = useTopBooks(TOP_BOOKS_SIZE);

  // Lazy load genre books with Intersection Observer
  const { genreBooks, genreLoaded, setGenreRef } = useLazyLoadGenres({
    enabled: !topBooksLoading,
  });

  const handleSearchSubmit = useCallback(
    (keyword) => {
      const trimmedKeyword = keyword.trim();
      if (trimmedKeyword) {
        navigate(`/search?keyword=${encodeURIComponent(trimmedKeyword)}`);
      }
    },
    [navigate],
  );

  // Build side title sections: 3 genres in a gradient wrapper
  const sideGenreSections = useMemo(() => {
    const sections = SIDE_GENRE_CONFIG.map((genre) => {
      const books = genreBooks[genre.id];
      const isLoaded = genreLoaded[genre.id];
      const genreData = genreMap.get(genre.id); // O(1) lookup instead of O(n) find

      return (
        <div
          key={genre.id}
          ref={setGenreRef(genre.id)}
          data-genre-id={genre.id}
          className="min-h-[100px]"
        >
          {isLoaded ? (
            books?.length > 0 ? (
              <SideTitleBookCarousel
                books={books}
                title={genreData?.genreName || genre.title}
                genreId={genre.id}
                className={genre.color}
              />
            ) : null
          ) : (
            <div className="py-16 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
            </div>
          )}
        </div>
      );
    });

    return (
      <div className="bg-gradient-to-b from-[#282B39] to-gray-900 rounded-xl flex flex-col gap-2">
        {sections}
      </div>
    );
  }, [genreBooks, genreLoaded, setGenreRef, genreMap]);

  // Build main genre carousel sections
  const genreSections = useMemo(() => {
    const sections = [];

    MAIN_GENRE_CONFIG.forEach((genre) => {
      const books = genreBooks[genre.id];
      const isLoaded = genreLoaded[genre.id];

      sections.push(
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
        </div>,
      );
    });

    return sections;
  }, [genreBooks, genreLoaded, setGenreRef]);

  return (
    <MainLayout
      showHero={true}
      heroContent={<Hero />}
      onSearchSubmit={handleSearchSubmit}
    >
      <main className="mt-8 px-4 sm:px-6 lg:px-8 space-y-8 min-h-[calc(100vh-400px)]">
        {/* Genre Showcase - User Interests */}
        <GenreShowcase />

       {!error && topBooksLoading && <TopBooksSkeleton />}
        
        {!error && !topBooksLoading && topBooks.length > 0 && (
          <TopBooksShowcase
            books={topBooks}
            title="Top sách được đọc nhiều nhất"
          />
        )}

        {/* Side Title Genres Categories */}
        {sideGenreSections}

        {/* Genre Carousels - Lazy Loaded */}
        {genreSections}
      </main>
    </MainLayout>
  );
};

export default React.memo(Home);
