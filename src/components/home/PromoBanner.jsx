import React from "react";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const PromoBanner = ({
  heading = "Khám phá thế giới tri thức",
  subtitle = "Hàng nghìn đầu sách chất lượng đang chờ bạn. Đọc miễn phí, mọi lúc, mọi nơi.",
  ctaText = "Khám phá ngay",
  ctaLink = "/search",
  variant = "primary",
}) => {
  const navigate = useNavigate();

  const backgrounds = {
    primary:
      "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
    warm: "bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50",
  };

  const accentColors = {
    primary: {
      dot: "bg-blue-400/10",
      ring: "border-blue-400/20 text-blue-600 dark:text-blue-400",
      btn: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
      glow: "from-blue-500/10 via-purple-500/5 to-transparent",
      text: "text-gray-900 dark:text-white",
      subtext: "text-gray-600 dark:text-gray-300",
    },
    warm: {
      dot: "bg-amber-400/10",
      ring: "border-amber-400/20 text-amber-600 dark:text-amber-400",
      btn: "bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600",
      glow: "from-amber-500/10 via-orange-500/5 to-transparent",
      text: "text-gray-900 dark:text-white",
      subtext: "text-gray-600 dark:text-gray-300",
    },
  };

  const colors = accentColors[variant] || accentColors.primary;
  const bg = backgrounds[variant] || backgrounds.primary;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className={`relative overflow-hidden rounded-2xl ${bg}`}
    >
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute -top-20 -right-20 h-72 w-72 rounded-full ${colors.dot} blur-3xl`}
        />
        <div
          className={`absolute -bottom-16 -left-16 h-56 w-56 rounded-full ${colors.dot} blur-2xl`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
        {/* Text content */}
        <div className="flex-1 text-center md:text-left">
          <motion.div
            variants={itemVariants}
            className={`mb-4 inline-flex items-center gap-2 rounded-full border ${colors.ring} bg-white/50 dark:bg-black/20 px-4 py-1.5 text-xs font-medium backdrop-blur-sm`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Tekbook - Thư viện số</span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className={`text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-4 ${colors.text}`}
          >
            {heading}
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className={`text-base sm:text-lg max-w-lg mb-6 leading-relaxed ${colors.subtext}`}
          >
            {subtitle}
          </motion.p>

          <motion.button
            variants={itemVariants}
            onClick={() => navigate(ctaLink)}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] ${colors.btn}`}
          >
            {ctaText}
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Decorative visual */}
        <motion.div
          variants={itemVariants}
          className="hidden md:flex items-center justify-center flex-shrink-0"
        >
          <div className="relative">
            {/* Stacked book shapes */}
            <div className={`absolute -inset-4 rounded-full bg-gradient-to-br ${colors.glow} blur-xl`} />
            <div className="relative grid grid-cols-2 gap-3">
              {[
                "from-blue-400 to-blue-600",
                "from-emerald-400 to-emerald-600",
                "from-amber-400 to-amber-600",
                "from-rose-400 to-rose-600",
              ].map((grad, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                  whileInView={{
                    opacity: 1,
                    scale: 1,
                    rotate: 0,
                    transition: { delay: 0.3 + i * 0.1, duration: 0.4 },
                  }}
                  viewport={{ once: true }}
                  className={`h-28 w-20 lg:h-32 lg:w-24 rounded-lg bg-gradient-to-br ${grad} shadow-lg`}
                >
                  <div className="h-full w-full rounded-lg bg-white/10 p-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="h-1.5 w-10 rounded bg-white/30" />
                      <div className="h-1.5 w-7 rounded bg-white/20" />
                    </div>
                    <div className="h-1 w-6 rounded bg-white/20" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default React.memo(PromoBanner);
