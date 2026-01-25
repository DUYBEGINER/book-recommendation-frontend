import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hook/useAuth.jsx';
import { PATHS } from '../../constant/routePath.jsx';
import ButtonLoginGoogle from '../../components/ButtonLoginGoogle.jsx';
import { validateLogin } from '../../utils/validatorInput.js'; 
import { useMessage } from '../../contexts/MessageProvider.jsx';

const Login = ({ onModeChange, onClose }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);



  const message = useMessage(); // use global message

  // Handle input changes
  const onChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const { email, password } = formData;
    // Validate email and password
    const validation = validateLogin({ email, password });
    if (!validation.valid) {
      message.warning('Vui lòng nhập đủ Email và Mật khẩu hợp lệ');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await login(email, password);
      // Display success message
      message.success('Đăng nhập thành công!');
      const role = result?.role;
      if (role && role.toUpperCase() === 'ADMIN') {
        navigate(PATHS.ADMIN.ROOT, { replace: true });
      }
      onClose?.(); // Close modal on successful login
    } catch (err) {
      message.error('Đăng nhập thất bại!');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6">Đăng nhập</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}


      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={formData.email}
            name="email"
            onChange={onChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Email"
            autoComplete="email"
            // required
          />
        </div>
        
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            name="password"
            onChange={onChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 pr-12"
            placeholder="Mật khẩu"
            autoComplete="password"
            // required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        
        <div className="flex justify-between items-center">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
          </label>
          <button
            type="button"
            onClick={() => onModeChange('forgot')}
            className="text-sm text-red-500 hover:underline"
          >
            Quên mật khẩu?
          </button>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">hoặc đăng nhập qua</span>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center space-x-4">
          <ButtonLoginGoogle />
        </div>
      </div>
      
      <p className="mt-6 text-center text-gray-600">
        Bạn chưa có tài khoản?{' '}
        <button
          onClick={() => onModeChange('register')}
          className="text-red-500 font-semibold hover:underline"
        >
          Đăng ký
        </button>
      </p>
    </div>
  );
};

export default Login;
