import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, ChevronDown, Menu, X, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import CategoryDropdown from "./CategoriesDropdown";
import ProfilePopover from "./ProfilePopover";
import SearchSuggestions from "./SearchSuggestions";
import useAuth from "../../hooks/useAuth";
import { searchBooks } from "../../services/manageBookService";

const SCROLL_THRESHOLD = 50;

const Header = ({ onAuthClick, user, onSearchSubmit }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, logout, loading } = useAuth();
  const searchTimeoutRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Scroll detection for floating pill effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const updateSearchValue = (value) => {
    setInternalSearch(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const response = await searchBooks(value.trim(), 0, 5);
        const books = response?.data || [];
        const booksArray = Array.isArray(books) ? books : [];
        setSuggestions(booksArray);
        setShowSuggestions(booksArray.length > 0);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 1000);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const triggerSearch = useCallback(() => {
    const query = (internalSearch || "").trim();
    if (onSearchSubmit) {
      onSearchSubmit(query);
      setShowSuggestions(false);
      if (mobileMenuOpen) setMobileMenuOpen(false);
    }
  }, [internalSearch, onSearchSubmit, mobileMenuOpen]);

  const handleSearchKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        triggerSearch();
      }
    },
    [triggerSearch],
  );

  const handleSuggestionSelect = useCallback(() => {
    setShowSuggestions(false);
    setInternalSearch("");
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Outer shell — adds padding when scrolled to create the floating gap */}
      <div
        className={`transition-all duration-500 ease-out ${
          isScrolled ? "pt-2.5 pb-0 px-3 sm:px-5" : "pt-0 pb-0 px-0"
        }`}
      >
        {/* Nav bar — morphs between full-width solid and floating glass pill */}
        <nav
          className={`mx-auto transition-all duration-500 ease-out ${
            isScrolled
              ? "max-w-7xl rounded-2xl backdrop-blur-xl bg-white/75 dark:bg-gray-900/70 border border-gray-200/60 dark:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
              : "max-w-full bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800"
          }`}
        >
          <div
            className={`mx-auto flex items-center justify-between transition-all duration-500 ${
              isScrolled
                ? "h-14 px-4 sm:px-5 max-w-7xl"
                : "h-16 px-4 sm:px-6 lg:px-8 max-w-7xl"
            }`}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <img
                src="/logo.png"
                alt="Logo"
                className={`transition-all duration-500 ${isScrolled ? "w-8 h-8" : "w-10 h-10"}`}
              />
              <div className="overflow-hidden">
                <h1
                  className={`font-bold text-gray-900 dark:text-white leading-tight transition-all duration-500 ${
                    isScrolled ? "text-lg" : "text-xl"
                  }`}
                >
                  Tekbook
                </h1>
                <p
                  className={`text-xs text-gray-500 dark:text-gray-400 leading-tight transition-all duration-500 origin-top ${
                    isScrolled
                      ? "max-h-0 opacity-0 scale-y-0"
                      : "max-h-5 opacity-100 scale-y-100"
                  }`}
                >
                  Books here, stories there
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4 flex-1 max-w-2xl mx-6">
              {/* Categories */}
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                  Thể loại
                  <ChevronDown className="w-4 h-4" />
                </button>
                <CategoryDropdown />
              </div>

              {/* Membership */}
              <Link
                to="/membership"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
              >
                <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />{" "}
                Hội viên
              </Link>

              {/* Search Bar */}
              <div className="flex-1 relative" ref={searchContainerRef}>
                <input
                  type="text"
                  placeholder="Tìm sách, tác giả..."
                  value={internalSearch}
                  onChange={(e) => updateSearchValue(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() =>
                    suggestions.length > 0 && setShowSuggestions(true)
                  }
                  className="w-full px-4 py-2 pr-10 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 border border-transparent focus:border-primary/30 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={triggerSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                  aria-label="Tìm kiếm"
                >
                  <Search className="w-4 h-4" />
                </button>

                {showSuggestions && (
                  <SearchSuggestions
                    suggestions={suggestions}
                    isLoading={isLoadingSuggestions}
                    onSelect={handleSuggestionSelect}
                    onClose={() => setShowSuggestions(false)}
                  />
                )}
              </div>
            </div>

            {/* Auth / Profile */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {loading ? (
                // Hiển thị trạng thái loading cho Desktop
                <svg
                  className="animate-spin h-5 w-5 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              ) : !isAuthenticated ? (
                <>
                  <button
                    onClick={() => onAuthClick("register")}
                    className="px-4 py-2 rounded-full text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    Đăng kí
                  </button>
                  <button
                    onClick={() => onAuthClick("login")}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary-hover transition-colors shadow-sm"
                  >
                    Đăng nhập
                  </button>
                </>
              ) : (
                <ProfilePopover user={user} logout={logout} />
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
              mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-4 pb-4 pt-2 border-t border-gray-200/60 dark:border-gray-700/40 space-y-3">
              {/* Mobile Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm sách..."
                  value={internalSearch}
                  onChange={(e) => updateSearchValue(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
                <button
                  type="button"
                  onClick={triggerSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                  aria-label="Tìm kiếm"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors">
                Thể loại
              </button>

              <Link
                to="/membership"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-purple-600 dark:text-white hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl transition-colors"
              >
                <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />{" "}
                Hội viên
              </Link>
              {loading ? (
                <div className="flex items-center justify-center py-2.5 h-full">
                  <svg
                    className="animate-spin h-5 w-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                </div>
              ) : !isAuthenticated ? (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      onAuthClick("register");
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    Đăng kí
                  </button>
                  <button
                    onClick={() => {
                      onAuthClick("login");
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary-hover transition-colors"
                  >
                    Đăng nhập
                  </button>
                </div>
              ) : (
                <div className="px-2 py-1">
                  <ProfilePopover user={user} logout={logout} />
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
