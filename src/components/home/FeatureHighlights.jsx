import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, Globe, Users } from "lucide-react";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Thư viện miễn phí",
    description:
      "Truy cập hàng nghìn đầu sách chất lượng hoàn toàn miễn phí. Đọc không giới hạn, không quảng cáo.",
    accent: "from-blue-500 to-cyan-400",
    bgAccent: "bg-blue-500/10 dark:bg-blue-400/10",
  },
  {
    icon: Sparkles,
    title: "Gợi ý thông minh",
    description:
      "Hệ thống AI phân tích sở thích đọc và đề xuất những cuốn sách phù hợp nhất dành cho bạn.",
    accent: "from-purple-500 to-pink-400",
    bgAccent: "bg-purple-500/10 dark:bg-purple-400/10",
  },
  {
    icon: Globe,
    title: "Đọc mọi lúc mọi nơi",
    description:
      "Giao diện tối ưu cho mọi thiết bị. Đọc sách trên điện thoại, máy tính bảng hay laptop đều mượt mà.",
    accent: "from-emerald-500 to-teal-400",
    bgAccent: "bg-emerald-500/10 dark:bg-emerald-400/10",
  },
  {
    icon: Users,
    title: "Cộng đồng đọc sách",
    description:
      "Chia sẻ đánh giá, nhận xét và kết nối với những người yêu sách trên khắp Việt Nam.",
    accent: "from-amber-500 to-orange-400",
    bgAccent: "bg-amber-500/10 dark:bg-amber-400/10",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const FeatureCard = React.memo(({ feature }) => {
  const Icon = feature.icon;

  return (
    <motion.div variants={cardVariants} className="group relative">
      <div className="relative h-full overflow-hidden rounded-2xl border border-gray-200/60 dark:border-gray-700/40 bg-white dark:bg-gray-800/60 p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:border-gray-300/80 dark:hover:border-gray-600/60 hover:-translate-y-1">
        {/* Hover glow */}
        <div
          className={`pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full ${feature.bgAccent} blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
        />

        {/* Icon */}
        <div
          className={`relative mb-5 inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${feature.accent} p-3 shadow-lg`}
        >
          <Icon className="h-6 w-6 text-white" strokeWidth={2} />
        </div>

        {/* Content */}
        <h3 className="relative mb-2 text-lg font-bold text-gray-900 dark:text-white">
          {feature.title}
        </h3>
        <p className="relative text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
});

FeatureCard.displayName = "FeatureCard";

const FeatureHighlights = ({ title = "Tại sao chọn Tekbook?" }) => {
  return (
    <div className="py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {title}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
          Tekbook mang đến trải nghiệm đọc sách trực tuyến hoàn hảo với nhiều tính năng nổi bật.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} feature={feature} />
        ))}
      </motion.div>
    </div>
  );
};

export default React.memo(FeatureHighlights);
