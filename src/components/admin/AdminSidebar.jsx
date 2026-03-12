import { Link, useLocation } from "react-router-dom";
import { Home, Book, Users, Tag, Brain, BookX } from "lucide-react";

const AdminSidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: Home },
    { path: "/admin/books", label: "Quản lí sách", icon: Book },
    { path: "/admin/books/deleted", label: "Sách đã ẩn", icon: BookX },
    { path: "/admin/users", label: "Quản lí người dùng", icon: Users },
    { path: "/admin/genres", label: "Quản lí thể loại", icon: Tag },
    { path: "/admin/recommendation", label: "Hệ thống gợi ý", icon: Brain },
  ];

  return (
    <aside className="w-64 bg-sidebar-admin-bg dark:bg-sidebar-admin-bg-dark border border-r-gray-200 dark:border-r-gray-800 min-h-screen max-h-screen flex flex-col sticky top-0 z-20">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <img src="/logo.png" alt="Logo" className="w-10 h-10" />
        <span className="text-sidebar-admin-text dark:text-sidebar-admin-text-dark font-bold text-2xl">
          Tekbook
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-2 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                isActive
                  ? "!bg-sidebar-admin-items-active dark:!bg-sidebar-admin-items-active-dark !text-sidebar-admin-items-active-text dark:!text-sidebar-admin-items-active-text-dark border border-sidebar-admin-items-active-border dark:border-sidebar-admin-items-active-border-dark"
                  : "!text-sidebar-admin-items-text dark:!text-sidebar-admin-items-text-dark hover:!bg-sidebar-admin-items-hover dark:hover:!bg-sidebar-admin-items-hover-dark border border-transparent"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-md font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
