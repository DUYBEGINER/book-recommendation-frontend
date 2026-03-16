import React, { useState } from 'react';
import { forgotPassword } from '../../services/authService.js';
import useMessage from '../../hooks/useMessage.jsx';

const ForgotPassword = ({ onModeChange }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const message = useMessage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword(email);
      setSubmitted(true);
      message.success('Vui lòng kiểm tra email của bạn');
    } catch (error) {
      if(error.response && error.response.status === 429) {
        message.error('Quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.');
      } else{ 
        // Show same success message to prevent email enumeration on the UI side
        setSubmitted(true);
        message.success('Vui lòng kiểm tra email của bạn');
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Kiểm tra email</h2>
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-600">
            Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu.
            Vui lòng kiểm tra hộp thư đến (và thư rác).
          </p>
          <p className="text-sm text-gray-400">Liên kết sẽ hết hạn sau 15 phút.</p>
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={() => onModeChange('login')}
            className="text-red-500 hover:underline"
          >
            Trở lại đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6">Quên mật khẩu</h2>
      <p className="text-gray-500 text-sm text-center mb-6">
        Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Email"
            autoComplete="email"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50"
        >
          {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => onModeChange('login')}
          className="text-red-500 hover:underline"
        >
          Trở lại đăng nhập
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
