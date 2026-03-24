import React, { useState } from "react";
import { CheckCircleFilled, CrownFilled, RocketFilled, StarFilled } from "@ant-design/icons";
import { Button, message } from "antd";
import { useThemeContext } from "../hooks/useTheme";
import MainLayout from "../layouts/MainLayout";

const Membership = () => {
  const { isDark } = useThemeContext();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleSubscribe = (planId) => {
    setLoadingPlan(planId);
    // Simulate API call
    setTimeout(() => {
      setLoadingPlan(null);
      message.success(`Đăng ký gói ${planId} thành công!`);
    }, 1500);
  };

  const plans = [
    {
      id: "1-month",
      name: "Cơ bản",
      duration: "1 Tháng",
      price: "49.000đ",
      originalPrice: "69.000đ",
      icon: <StarFilled className="text-3xl text-blue-500" />,
      features: [
        "Truy cập toàn bộ sách",
        "Không quảng cáo",
        "Tải sách đọc offline (tối đa 5 cuốn)",
        "Đánh dấu trang và ghi chú",
      ],
      colorClass: "blue",
      ringClass: "ring-blue-500 shadow-blue-500/20",
      textClass: "text-blue-500",
      popular: false,
    },
    {
      id: "3-months",
      name: "Tiết kiệm",
      duration: "3 Tháng",
      price: "129.000đ",
      originalPrice: "189.000đ",
      icon: <RocketFilled className="text-3xl text-purple-500" />,
      features: [
        "Tất cả tính năng gói Cơ bản",
        "Tải sách đọc offline không giới hạn",
        "Đọc sách độc quyền",
        "Tùy chỉnh giao diện đọc nâng cao",
      ],
      colorClass: "purple",
      ringClass: "ring-purple-500 shadow-purple-500/20",
      textClass: "text-purple-500",
      popular: true,
      tag: "PHỔ BIẾN NHẤT",
    },
    {
      id: "1-year",
      name: "Cao cấp",
      duration: "1 Năm",
      price: "399.000đ",
      originalPrice: "599.000đ",
      icon: <CrownFilled className="text-3xl text-yellow-500" />,
      features: [
        "Tất cả tính năng gói Tiết kiệm",
        "Ưu tiên nhận sách mới sớm nhất",
        "Hỗ trợ khách hàng ưu tiên 24/7",
        "Huy hiệu thành viên VIP",
        "Tặng 1 tháng sử dụng miễn phí cho bạn bè",
      ],
      colorClass: "yellow",
      ringClass: "ring-yellow-500 shadow-yellow-500/20",
      textClass: "text-yellow-500",
      popular: false,
      tag: "TIẾT KIỆM TỐI ĐA",
    },
  ];

  return (
    <MainLayout>
      <div className={`py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300 rounded-3xl mb-12 shadow-sm ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
              Nâng cấp trải nghiệm đọc của bạn
            </h1>
            <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Chọn gói hội viên phù hợp để mở khóa toàn bộ tính năng và tận hưởng thế giới tri thức không giới hạn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col p-8 rounded-2xl shadow-lg transition-transform duration-300 hover:-translate-y-2
                  ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}
                  ${plan.popular ? `ring-2 ${plan.ringClass}` : ''}
                `}
              >
                {plan.tag && (
                  <div className={`absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm
                    ${plan.colorClass === 'yellow' ? 'bg-yellow-500 text-yellow-900' : 'bg-purple-600 text-white'}
                  `}>
                    {plan.tag}
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{plan.duration}</p>
                  </div>
                  <div className={`p-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    {plan.icon}
                  </div>
                </div>

                <div className="mb-6 flex flex-col">
                  <div className={`text-sm line-through mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {plan.originalPrice}
                  </div>
                  <div className="flex items-baseline text-4xl font-extrabold">
                    {plan.price}
                    <span className={`ml-1 text-xl font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      /{plan.duration.toLowerCase()}
                    </span>
                  </div>
                </div>

                <ul className="flex-1 space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircleFilled className={`mt-1 mr-3 ${plan.textClass}`} />
                      <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  type={plan.popular ? 'primary' : 'default'}
                  size="large"
                  className={`w-full h-12 text-base font-semibold rounded-xl
                    ${plan.popular && !isDark ? 'bg-purple-600 hover:bg-purple-700' : ''}
                    ${!plan.popular && isDark ? 'bg-gray-700 text-white border-gray-600 hover:border-gray-500 hover:text-white' : ''}
                  `}
                  onClick={() => handleSubscribe(plan.id)}
                  loading={loadingPlan === plan.id}
                >
                  Đăng ký ngay
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Membership;
