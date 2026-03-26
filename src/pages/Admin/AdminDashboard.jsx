import {useMemo} from "react";
import {useQuery} from "@tanstack/react-query";
import AdminLayout from "../../layouts/AdminLayout";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, } from "recharts";
import { Users, BookOpen, Layers, PenSquare, Star, Heart, } from "lucide-react";

import ListCard from "../../components/admin/ListCard";
import StatCard from "../../components/admin/StatCard";

import { getAdminDashboard, getNewUsers } from "../../services/dashboardService";

const TIME_RANGES = [
  { label: "7 ngày", value: 7 },
  { label: "30 ngày", value: 30 }
]

const formatNumber = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0";
  }
  return value.toLocaleString("en-US");
};

const formatDateLabel = (dateString) => {
  if (!dateString) return "";
  const parts = dateString.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return dateString;
};

const AdminDashboard = () => {

  const newUsersQuery = useQuery({
    queryKey: ["newUsersLast7Days", TIME_RANGES[0].value],
    queryFn: () => getNewUsers(TIME_RANGES[0].value),
    refetchOnWindowFocus: false, // Thêm dòng này
  });

  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: getAdminDashboard,
     refetchOnWindowFocus: false, // Thêm dòng này
    select: (response) => response?.data ?? {},
  });

  const stats = useMemo(
    () => [
      {
        icon: Users,
        label: "Tổng số người đọc",
        value: dashboardQuery.data?.totalUsers ?? 0,
      },
      {
        icon: BookOpen,
        label: "Tổng số sách",
        value: dashboardQuery.data?.totalBooks ?? 0,
      },
      {
        icon: Layers,
        label: "Tổng số thể loại",
        value: dashboardQuery.data?.totalGenres ?? 0,
      },
      {
        icon: PenSquare,
        label: "Tổng số tác giả",
        value: dashboardQuery.data?.totalAuthors ?? 0,
      },
    ],
    [dashboardQuery.data],
  );

  const chartData = useMemo(
    () =>
      (newUsersQuery?.data?.data ?? []).map((item) => ({
        date: formatDateLabel(item.date),
        value: item.count ?? 0,
      })),
    [newUsersQuery.data],
  );

  const topRatedBooks = useMemo(
    () =>
      (dashboardQuery.data?.topRatedBooks?.content ?? []).map((book) => ({
        id: book.id,
        title: book.title,
        subtitle: `${formatNumber(book.ratingCount ?? 0)} đánh giá`,
        cover: book.coverImageUrl
          ? book.coverImageUrl
          : "https://via.placeholder.com/56x56?text=Book",
        score: Number(book.averageRating ?? 0),
      })),
    [dashboardQuery.data],
  );

  const topFavoriteBooks = useMemo(
    () =>
      (dashboardQuery.data?.topFavoritedBooks?.content ?? []).map((book) => ({
        id: book.id,
        title: book.title,
        subtitle: `${formatNumber(book.favoriteCount ?? 0)} lượt yêu thích`,
        cover: book.coverImageUrl
          ? book.coverImageUrl
          : "https://via.placeholder.com/56x56?text=Book",
        score: Number(book.favoriteCount ?? 0),
      })),
    [dashboardQuery.data],
  );

  return (
    <AdminLayout title="ADMIN">
      <div className="rounded-3xl p-6 md:p-8 bg-[#F4F7FF] dark:bg-slate-950/30">
        <h2 className="text-3xl font-semibold text-indigo-900 dark:text-white mb-6">
          Thống kê
        </h2>

        {/* Hàng 1: 4 ô thống kê + chart */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
          <div className="grid grid-cols-2 grid-rows-2 auto-rows-fr col-span-2 gap-6 h-full">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                isLoading={dashboardQuery.isFetching}
              />
            ))}
          </div>

          <div className="lg:col-span-2 h-full">
            <div className="h-full rounded-3xl p-4 md:p-5 bg-white/60 dark:bg-slate-900/60 border border-white/70 dark:border-slate-800 shadow-sm">
              <div className="text-slate-700 dark:text-slate-200 font-medium mb-3">
                Người dùng mới trong 7 ngày qua
              </div>
              <div className="h-56 md:h-64 rounded-2xl bg-[#F3F6FF] dark:bg-slate-800 p-3 md:p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData.length ? chartData : [{ date: "", value: 0 }]}
                    margin={{ top: 24, right: 12, left: 8, bottom: 0 }}
                    barCategoryGap={24}
                  >
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#334155", fontSize: 12, fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      formatter={(v) => formatNumber(v)}
                      labelFormatter={(l) => `Ngày ${l}`}
                      contentStyle={{
                        borderRadius: 12,
                        border: "none",
                        boxShadow:
                          "0 6px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)",
                      }}
                      cursor={false}
                      wrapperStyle={{ zIndex: 50 }}
                    />
                    <defs>
                      <linearGradient id="mint" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4AD8C7" />
                        <stop offset="100%" stopColor="#39C1B0" />
                      </linearGradient>
                      <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.18" />
                      </filter>
                    </defs>
                    <Bar
                      dataKey="value"
                      name="Số lượng"
                      fill="url(#mint)"
                      radius={[12, 12, 12, 12]}
                      maxBarSize={42}
                      style={{ filter: "url(#soft)" }}
                    >
                      <LabelList
                        dataKey="value"
                        position="top"
                        className="dark:text-white"
                        formatter={formatNumber}
                        style={{ fontSize: 12, fill: "#0f172a" }}
                        offset={8}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Hàng 2: 2 bảng danh sách */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ListCard
            title="Top sách được đánh giá cao"
            subtitle="Các đầu sách được đánh giá cao nhất:"
            items={topRatedBooks}
            variant="rating"
            isLoading={dashboardQuery.isFetching}
          />
          <ListCard
            title="Top sách được yêu thích nhất"
            subtitle="Các đầu sách được yêu thích nhất:"
            items={topFavoriteBooks}
            variant="favorite"
            isLoading={dashboardQuery.isFetching}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
