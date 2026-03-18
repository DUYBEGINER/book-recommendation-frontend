import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * TopBooksShowcase — displays a ranked grid (desktop) or horizontal carousel
 * (tablet/mobile) of the top-read books with slanted clip-path styling.
 *
 * Fixes applied:
 *   - Isolated hover scope: each BookItem has its own `group` without nesting
 *     conflicts with the outer carousel container.
 *   - Improved responsive breakpoints for optimal card sizing across devices.
 *   - Navigation buttons use local hover state instead of parent `group-hover`.
 */
const TopBooksShowcase = ({ books = [], title = "Top sách nổi bật" }) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [showNav, setShowNav] = useState(false);

  if (!books || books.length === 0) return null;

  const handleBookClick = (bookId) => navigate(`/books/${bookId}`);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const cardWidth = container.querySelector('[data-book-card]')?.offsetWidth || 300;
    container.scrollBy({
      left: direction === "left" ? -cardWidth - 16 : cardWidth + 16,
      behavior: "smooth",
    });
  };

  const topBooks = books.slice(0, 4);

  return (
    <section className="mb-12">
      <h2 className="mb-6 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h2>

      {/* Desktop Grid (lg+): 4 columns */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-4">
        {topBooks.map((book, index) => (
          <BookCard
            key={book.bookId}
            book={book}
            index={index}
            onClick={handleBookClick}
          />
        ))}
      </div>

      {/* Tablet/Mobile: Horizontal scroll carousel */}
      <div
        className="lg:hidden relative"
        onMouseEnter={() => setShowNav(true)}
        onMouseLeave={() => setShowNav(false)}
        onTouchStart={() => setShowNav(false)}
      >
        {/* Left nav */}
        <button
          onClick={() => scroll("left")}
          className={`
            absolute left-1 top-1/3 -translate-y-1/2 z-20
            bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg
            transition-opacity duration-200
            ${showNav ? "opacity-100" : "opacity-0 pointer-events-none"}
          `}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800 dark:text-white" />
        </button>

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          className="
            flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory
            pb-2 -mb-2
          "
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {topBooks.map((book, index) => (
            <BookCard
              key={book.bookId}
              book={book}
              index={index}
              onClick={handleBookClick}
              isCarousel
            />
          ))}
        </div>

        {/* Right nav */}
        <button
          onClick={() => scroll("right")}
          className={`
            absolute right-1 top-1/3 -translate-y-1/2 z-20
            bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg
            transition-opacity duration-200
            ${showNav ? "opacity-100" : "opacity-0 pointer-events-none"}
          `}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-gray-800 dark:text-white" />
        </button>
      </div>
    </section>
  );
};

/**
 * BookCard — individual ranked book card with slanted clip-path.
 * Each card is a self-contained `group` to avoid hover conflicts.
 */
const BookCard = React.memo(({ book, index, onClick, isCarousel = false }) => {
  const slantClass = index % 2 === 0 ? "clip-slant-left" : "clip-slant-right";

  return (
    <div
      data-book-card
      className={`
        flex-shrink-0 snap-start
        ${isCarousel
          ? "w-[70vw] xs:w-[55vw] sm:w-[45vw] md:w-[35vw] max-w-[280px]"
          : "w-full"
        }
      `}
    >
      {/* Card — isolated group scope */}
      <div
        className={`
          group relative cursor-pointer
          bg-transparent hover:bg-[#FFD875]
          shadow-lg hover:shadow-2xl
          transition-shadow duration-200
          ${slantClass}
        `}
        onClick={() => onClick(book.bookId)}
      >
        {/* Image container with scale effect */}
        <div
          className={`
            relative w-full overflow-hidden
            aspect-[3/4]
            transition-transform duration-300 ease-out
            group-hover:scale-[0.97]
            ${slantClass}
          `}
        >
          <img
            src={book.coverImageUrl || book.cover || "/placeholder-book.jpg"}
            alt={book.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          {/* Hover overlay */}
          <div
            className="
              absolute inset-0
              bg-amber-300/20 opacity-0 group-hover:opacity-100
              transition-opacity duration-200
              pointer-events-none
            "
          />
          {/* Dot pattern */}
          <div
            className="
              absolute inset-0 pointer-events-none
              bg-[radial-gradient(#000_1px,transparent_1px)]
              [background-size:4px_4px] opacity-20
            "
          />
        </div>
      </div>

      {/* Book info */}
      <div className="flex items-center gap-3 mt-3">
        <span
          className="
            bg-[linear-gradient(39deg,rgba(254,207,89,1),rgba(255,241,204,1))]
            bg-clip-text text-transparent
            font-bold text-3xl sm:text-4xl
            leading-none
          "
          style={{ fontFamily: "var(--font-sekuya, sans-serif)" }}
        >
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className="
              font-medium text-sm sm:text-base
              text-gray-900 dark:text-white
              truncate cursor-pointer
              hover:text-[rgba(254,207,89,1)] transition-colors
            "
            onClick={() => onClick(book.bookId)}
          >
            {book.title}
          </p>
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
            {book.authors?.map((a) => a.authorName).join(", ") || "Không rõ tác giả"}
          </span>
        </div>
      </div>
    </div>
  );
});

BookCard.displayName = "BookCard";

export default TopBooksShowcase;
