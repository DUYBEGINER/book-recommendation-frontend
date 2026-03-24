import React from "react";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { BookMarked, Users, Library, Star } from "lucide-react";

const STATS = [
  { icon: BookMarked, label: "Đầu sách", value: 50000, suffix: "+", color: "text-blue-500" },
  { icon: Users, label: "Độc giả", value: 10000, suffix: "+", color: "text-emerald-500" },
  { icon: Library, label: "Thể loại", value: 30, suffix: "+", color: "text-purple-500" },
  { icon: Star, label: "Đánh giá", value: 25000, suffix: "+", color: "text-amber-500" },
];

const formatNumber = (num) => {
  if (num >= 1000) return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
  return num.toString();
};

const useCountUp = (target, isInView, duration = 1500) => {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  return count;
};

const StatItem = React.memo(({ stat, isInView }) => {
  const Icon = stat.icon;
  const count = useCountUp(stat.value, isInView);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center text-center p-4"
    >
      <div className={`mb-3 ${stat.color}`}>
        <Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.8} />
      </div>
      <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
        {formatNumber(count)}
        {stat.suffix}
      </span>
      <span className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        {stat.label}
      </span>
    </motion.div>
  );
});

StatItem.displayName = "StatItem";

const PlatformIntro = () => {
  const statsRef = useRef(null);
  const isInView = useInView(statsRef, { once: true, amount: 0.4 });

  return (
    <div className="relative overflow-hidden rounded-2xl bg-transparent">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gray-200 dark:bg-gray-700" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gray-200 dark:bg-gray-700" />
      </div>

      <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
              Về Tekbook
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              Nền tảng đọc sách trực tuyến{" "}
              <span className="text-primary">hàng đầu</span> Việt Nam
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Tekbook là thư viện số miễn phí, nơi bạn có thể khám phá hàng
              nghìn đầu sách từ nhiều thể loại khác nhau. Với giao diện thân
              thiện và hệ thống gợi ý thông minh, chúng tôi giúp bạn tìm được
              cuốn sách phù hợp nhất.
            </p>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              Dù bạn là người đam mê tiểu thuyết, yêu thích sách kỹ năng sống
              hay muốn tìm hiểu về tài chính, Tekbook luôn có những gì bạn cần.
            </p>
          </motion.div>

          {/* Stats grid */}
          <div ref={statsRef}>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {STATS.map((stat) => (
                <StatItem key={stat.label} stat={stat} isInView={isInView} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PlatformIntro);
