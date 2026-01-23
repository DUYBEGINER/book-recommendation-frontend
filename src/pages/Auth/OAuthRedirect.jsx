import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../../hook/useAuth';
import api from '../../config/ApiConfig';
import { setAuthData } from '../../utils/storage';

const OAuthRedirect = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { fetchUserProfile } = useAuth();
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleOAuthCallback = async () => {
            const oauth = searchParams.get('oauth');

            if (oauth === 'success') {
                try {
                    // Gọi refresh endpoint để lấy access token
                    // Cookie refreshToken sẽ được tự động gửi kèm
                    const response = await api.post('/auth/refresh');
                    console.log('Refresh response:', response);
                    
                    const accessToken = response?.accessToken || response?.data?.accessToken;
                    
                    if (accessToken) {
                        // Lưu access token vào localStorage
                        setAuthData(accessToken, null);
                        localStorage.setItem('ACCESS_TOKEN', accessToken);
                        
                        // Fetch user profile
                        await fetchUserProfile();
                        
                        setStatus('success');
                        
                        // Redirect về trang chủ sau 1 giây
                        setTimeout(() => {
                            navigate('/', { replace: true });
                        }, 1000);
                    } else {
                        throw new Error('Không nhận được access token');
                    }
                } catch (err) {
                    console.error('OAuth callback error:', err);
                    setStatus('error');
                    setError(err.message || 'Đăng nhập thất bại');
                    
                    // Redirect về trang login sau 2 giây
                    setTimeout(() => {
                        navigate('/', { replace: true });
                    }, 2000);
                }
            } else {
                setStatus('error');
                setError('OAuth không thành công');
                setTimeout(() => {
                    navigate('/', { replace: true });
                }, 2000);
            }
        };

        handleOAuthCallback();
    }, [searchParams, navigate, fetchUserProfile]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            {status === 'loading' && (
                <>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
                    <p className="text-gray-600">Đang xử lý đăng nhập...</p>
                </>
            )}
            {status === 'success' && (
                <>
                    <div className="text-green-500 text-5xl mb-4">✓</div>
                    <p className="text-green-600 font-medium">Đăng nhập thành công!</p>
                    <p className="text-gray-500 text-sm mt-2">Đang chuyển hướng...</p>
                </>
            )}
            {status === 'error' && (
                <>
                    <div className="text-red-500 text-5xl mb-4">✕</div>
                    <p className="text-red-600 font-medium">Đăng nhập thất bại</p>
                    <p className="text-gray-500 text-sm mt-2">{error}</p>
                </>
            )}
        </div>
    );
};

export default OAuthRedirect;
