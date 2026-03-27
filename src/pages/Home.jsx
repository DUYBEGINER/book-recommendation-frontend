import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Components
import Hero from "../components/home/Hero";
import BookCarousel from "../components/common/BookCarousel";
import TopBooksShowcase, {
  TopBooksSkeleton,
} from "../components/home/TopBooksShowcase";
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

const OBSERVER_OPTIONS = {
  root: null,
  rootMargin: "100px",
  threshold: 0.1,
};

// Skeleton Components for Lazy Loading (Tối ưu CLS)
const CarouselSkeleton = ({ hasSubtitle = true }) => (
  <div className="mb-12 animate-pulse w-full">
    {/* Header Skeleton */}
    <div className="flex justify-between items-end mb-6">
      <div>
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
        {hasSubtitle && <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded mt-2"></div>}
      </div>
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded hidden sm:block"></div>
    </div>
    {/* Cards Skeleton */}
    <div className="flex gap-6 overflow-hidden p-2">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="min-w-[180px] w-[180px] flex-shrink-0 space-y-3">
          <div className="w-full aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-lg shadow-sm"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SideTitleCarouselSkeleton = () => (
  <div className="relative flex flex-col md:flex-row rounded-xl overflow-hidden mb-5 animate-pulse w-full">
    {/* Sidebar Title */}
    <div className="md:w-[22%] p-6 md:p-8 md:pr-4 flex flex-col justify-center shrink-0">
      <div className="h-8 md:h-10 bg-[#3a3f58] dark:bg-gray-700 rounded w-3/4 mb-8"></div>
      <div className="h-4 bg-[#3a3f58] dark:bg-gray-700 rounded w-1/2"></div>
    </div>
    {/* Carousel */}
    <div className="flex-1 p-4 md:p-6 md:pl-0 flex gap-4 overflow-hidden items-center pb-4 md:pb-0">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="min-w-[200px] w-[200px] flex-shrink-0 space-y-3">
          <div className="w-full aspect-[2/3] bg-[#3a3f58] dark:bg-gray-700 rounded-lg shadow-sm"></div>
          <div className="space-y-2">
            <div className="h-4 bg-[#3a3f58] dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-[#3a3f58] dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

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
          className="min-h-[350px]"
        >
          {books !== undefined ? (
            books.length > 0 ? (
              <SideTitleBookCarousel
                books={books}
                title={genreData?.genreName || genre.title}
                genreId={genre.id}
                className={genre.color}
              />
            ) : null // Không có sách thì không hiển thị component này
          ) : (
            // books là undefined: Chưa cuộn tới HOẶC đang chờ API -> Hiện Skeleton
            <SideTitleCarouselSkeleton />
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

      sections.push(
        <div
          key={genre.id}
          ref={setGenreRef(genre.id)}
          data-genre-id={genre.id}
          className="min-h-[350px]"
        >
          {books !== undefined ? (
            books.length > 0 ? (
              <BookCarousel
                books={books}
                title={genre.title}
                genreId={genre.id}
                genreName={genre.name}
                subtitle={true}
              />
            ) : (
              // Chỉ hiện "Không có sách" khi API ĐÃ XONG và mảng trả về rỗng
              <div className="py-8 text-center h-[350px] flex items-center justify-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Không có sách thể loại {genre.name}
                </p>
              </div>
            )
          ) : (
            // Đang chờ API -> Giữ nguyên trạng thái Loading với Skeleton
            <CarouselSkeleton hasSubtitle={true} />
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
