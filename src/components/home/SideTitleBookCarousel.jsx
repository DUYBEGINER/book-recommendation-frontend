import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import BookCard from "../common/BookCard";

const SideTitleBookCarousel = ({
  books,
  title,
  genreId,
  className,
}) => {

  console.log("Classname for SideTitleBookCarousel:", className);
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = direction === "left" ? -400 : 400;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!books || books.length === 0) return null;

  return (
    <div
      className={`relative flex flex-col md:flex-row rounded-xl overflow-hidden mb-5`}
    >
      {/* Sidebar Title */}
      <div className="md:w-[22%] p-6 md:p-8 md:pr-4 flex flex-col justify-center shrink-0">
        <h2
          className={`text-2xl md:text-[32px] font-bold bg-gradient-to-r ${className} bg-clip-text text-transparent leading-tight mb-8`}
          style={{ textTransform: "capitalize" }}
        >
          {title}
        </h2>
        <Link
          to={`/category/${genreId}`}
          className="inline-flex items-center !text-white hover:text-[#E2C677] font-medium transition-colors text-sm group"
        >
          Xem toàn bộ
          <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Carousel */}
      <div className="relative flex-1 p-4 md:p-6 md:pl-0 overflow-hidden group">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white text-black h-10 w-10 flex items-center justify-center rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth h-full items-center pb-4 md:pb-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {books.map((book) => (
            <div
              key={book.id}
              className="min-w-[200px] w-[200px] flex-shrink-0"
            >
              <BookCard book={book} />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white text-black h-10 w-10 flex items-center justify-center rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
    </div>
  );
};

export default React.memo(SideTitleBookCarousel);
