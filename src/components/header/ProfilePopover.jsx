import React, { useState, useRef, useEffect } from 'react';
import { User, Book, History, Moon, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Switch } from "antd";
import {useThemeContext}  from '../../hooks/useTheme';
import { AnimatePresence, motion} from 'framer-motion';

const ProfilePopover = ({ user, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  // Theme management
  const { theme, setTheme } = useThemeContext();

  const handleThemeChange = (checked) => {
    setTheme(checked ? 'dark' : 'light');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const handleMenuClick = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const menuItems = [
    { icon: User, label: 'Quản lí tài khoản', path: '/manage-account/profile' },
    { icon: Book, label: 'Sách yêu thích', path: '/manage-account/favorite-books' },
    { icon: History, label: 'Lịch sử đọc sách', path: '/manage-account/history-reading' },
  ];  

  // Animation variants
  const panelVariants = {
    hidden: { opacity: 0, scale: 0.96, y: -6 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 420, damping: 28 } },
    exit: { opacity: 0, scale: 0.98, y: -4, transition: { duration: 0.12 } }
  };
  const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.03, delayChildren: 0.03 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: -6 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.18 } }
  };
  
  const displayName = user?.fullName || user?.name || user?.username || 'Người dùng';
  const email = user?.email || 'Chưa cập nhật email';
  const avatarSrc = user?.avatarUrl || user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop';


  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
      >
        <span className="text-sm font-medium hidden md:block text-gray-800 dark:text-gray-200">{user?.fullName || 'No Name'}</span>
        <img
          src={avatarSrc}
          alt={displayName}
          className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600"
        />
        <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
      {isOpen && (
         <motion.div
            key="popover"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl shadow-xl dark:shadow-2xl border border-gray-200/80 dark:border-gray-700/60 overflow-hidden z-50 origin-top-right backdrop-blur-xl"
          >
          {/* User Info Header */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center bg-gray-50 dark:bg-gray-900 gap-3 p-3 rounded-xl">
              <img
                src={avatarSrc}
                alt={displayName}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
              />
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{displayName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
           <motion.div className="py-1.5" variants={listVariants} initial="hidden" animate="visible">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                    variants={itemVariants}
                    key={item.path}
                    onClick={() => handleMenuClick(item.path)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors text-left"
                  >
                  <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-200">{item.label}</span>
                </motion.button>
              );
            })}

            {/* Dark Mode Toggle */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-200">Dark Mode</span>
              </div>
              <div className="relative">
                <Switch checked={theme === 'dark'} onChange={handleThemeChange} />
              </div>
            </motion.div>
           </motion.div>

          {/* Logout Button */}
          <motion.div variants={itemVariants} className="border-t border-gray-200 dark:border-gray-700 p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Đăng xuất</span>
            </button>
          </motion.div>

         </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePopover;
