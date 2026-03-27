import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { applyPreset } from "../../utils/cloudinaryUtils.js";
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

{/* Skeleton loader for TopBooksShowcase */}
export const TopBooksSkeleton = () => {
  const skeletonItems = [0, 1, 2, 3];

  return (
    <section className="mb-12">
      <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded mb-6"></div>
      
      {/* Desktop */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-4">
        {skeletonItems.map((i) => (
          <SkeletonCard key={`desk-${i}`} index={i} />
        ))}
      </div>

      {/* Mobile/Tablet */}
      <div className="lg:hidden flex gap-4 overflow-hidden pb-2 -mb-2">
        {skeletonItems.map((i) => (
          <SkeletonCard key={`mob-${i}`} index={i} isCarousel={true} />
        ))}
      </div>
    </section>
  );
};

// Reusable BookCard component with slanted clip-path and hover effects
const BaseBookCard = ({ children, isCarousel, index, onClick }) => {
  const slantClass = index % 2 === 0 ? "clip-slant-left" : "clip-slant-right";
  return (
    <div
      className={`flex-shrink-0 snap-start ${
        isCarousel
          ? "w-[70vw] xs:w-[55vw] sm:w-[45vw] md:w-[35vw] max-w-[280px]"
          : "w-full"
      }`}
      onClick={onClick}
    >
      {/* Vỏ bọc chứa slant và hover scale chung */}
      <div className={`group relative ${slantClass} ${onClick ? 'cursor-pointer' : ''}`}>
        {children.cover} {/* Slot cho ảnh bìa */}
      </div>

      <div className="flex items-center gap-3 mt-3">
        {children.rank} {/* Slot cho Số thứ tự */}
        <div className="flex-1 min-w-0">
          {children.info} {/* Slot cho Tiêu đề và Tác giả */}
        </div>
      </div>
    </div>
  );
};

/**
 * BookCard — individual ranked book card with slanted clip-path.
 * Each card is a self-contained `group` to avoid hover conflicts.
 */
const BookCard = React.memo(({ book, index, onClick, isCarousel }) => {
  const slantClass = index % 2 === 0 ? "clip-slant-left" : "clip-slant-right";
  // Áp dụng tối ưu hóa kích thước + định dạng
  const optimizedCover = book.coverImageUrl ? applyPreset(book.coverImageUrl, "bookCard") : "/placeholder-book.jpg";
  
  return (
    <BaseBookCard index={index} isCarousel={isCarousel} onClick={() => onClick(book.bookId)}>
      {{
        cover: (
          <div className={`relative w-full overflow-hidden aspect-[3/4] transition-transform duration-300 group-hover:scale-[0.97] ${slantClass}`}>
            <img src={optimizedCover} alt={book.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-amber-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        ),
        rank: (
          <span className="bg-[linear-gradient(39deg,rgba(254,207,89,1),rgba(255,241,204,1))] bg-clip-text text-transparent font-bold text-3xl sm:text-4xl">
            {index + 1}
          </span>
        ),
        info: (
          <>
            <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">{book.title}</p>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
              {book.authors?.map(a => a.authorName).join(", ")}
            </span>
          </>
        )
      }}
    </BaseBookCard>
  );
});

const SkeletonCard = ({ index, isCarousel }) => {
  const slantClass = index % 2 === 0 ? "clip-slant-left" : "clip-slant-right";

  return (
    <BaseBookCard index={index} isCarousel={isCarousel}>
      {{
        cover: (
          <div className={`w-full aspect-[3/4] bg-gray-200 dark:bg-gray-800 animate-pulse ${slantClass}`}></div>
        ),
        rank: (
          <div className="w-8 h-10 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
        ),
        info: (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 animate-pulse rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-800 animate-pulse rounded w-1/2"></div>
          </div>
        )
      }}
    </BaseBookCard>
  );
};

export default TopBooksShowcase;
