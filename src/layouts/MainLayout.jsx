import React, {useState} from 'react';
import Header from '../components/header/Header';
import Footer from './Footer';
import AuthModal from '../components/auth/AuthModal';
import ThemeToggle from '../components/common/ThemeToggle';
import useAuth from '../hooks/useAuth';

const MainLayout = ({
  children,
  showHero = false,
  heroContent = null,
  onSearchSubmit,
  onGenreSelect,
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register' or 'forgot'
  const { user } = useAuth();

  // Hàm này sẽ được truyền xuống cho Header để mở modal
  const openAuthModal = (mode) => {
    setAuthMode(mode); // Cập nhật chế độ (login/register)
    setShowAuthModal(true); // Hiển thị modal
  };


  return (
    <div className="min-h-[calc(100vh-120px)] bg-background dark:bg-gray-900 flex flex-col">
      <Header
        onAuthClick={openAuthModal}
        user={user}
        onSearchSubmit={onSearchSubmit}
        onGenreSelect={onGenreSelect}
      />
      {showHero && heroContent}
      <main className={`flex-1 max-w-7xl mx-auto w-full relative z-20 ${showHero ? "-mt-20" : "mt-5"}`}>
        {children}
      </main>
      <Footer />
      {/* Render AuthModal có điều kiện */}
      {/* Chỉ hiển thị khi showAuthModal là true */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)} // Hàm để đóng modal
          initialMode={authMode} // Truyền chế độ ban đầu
          onModeChange={setAuthMode} // Hàm để thay đổi chế độ từ bên trong modal
        />
      )}
      {!user && <ThemeToggle />}
    </div>

  );
};

export default MainLayout;
