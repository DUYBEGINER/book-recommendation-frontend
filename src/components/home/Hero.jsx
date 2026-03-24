import React from "react";

const Hero = () => {
  return (
    <div className="relative h-96 md:h-96 lg:h-120 xl:h-150 bg-gradient-to-r from-gray-900 to-gray-800 overflow-hidden">
      <img
        className="absolute inset-0 w-full h-full object-cover object-center opacity-50"
        srcSet="
          /hero-mobile.webp 750w,
          /hero-tablet.webp 1280w,
          /hero-big.webp 1920w
        "
        sizes="(max-width: 1280px) 100vw, 100vw"
        src="/hero-desktop.jpg"
        alt="Thư viện trực tuyến với 50.000 ebook"
        fetchPriority="high"
      />
      <div className="pointer-events-none absolute inset-0 z-10 h-full w-full bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:4px_4px] opacity-20"/>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col items-center justify-center text-center z-20">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          THƯ VIỆN Ở TRONG TẦM TAY BẠN
        </h2>
        <p className="text-lg md:text-xl text-gray-200 max-w-3xl">
          Chào mừng bạn đến với thư viện thân thiện gần gũi. Chúng tôi có hơn
          <span className="font-bold text-yellow-400"> 50.000 ebook </span>
          miễn phí đang chờ bạn khám phá.
        </p>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background dark:from-gray-900 to-transparent z-10 pointer-events-none" />
    </div>
  );
};

export default Hero;