// import api from '../config/ApiConfig.js'
import {axiosClient} from '../utils/axiousClient.jsx';

export const getUser = async () => {
    try {
        const response = await axiosClient.get("/auth/profile");
        console.log("Get user profile response:", response);
        return response.data;
    } catch (error) {
        console.error('Get user profile failed:', error.response?.data || error.message)
        throw error
    }
}


export const login = async (email, password) => {
    try {
        const response = await axiosClient.post('/auth/login', { email, password })
        return response.data;
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message)
        throw error
    }
}

export const register = async (userData) => {
    try {
        const response = await axiosClient.post('/auth/register', userData)
        return response.data;
    } catch (error) {
        console.error('Register failed:', error.response?.data || error.message)
        throw error;
    }
}


export const logout = async () => {
    try{
        const response = await axiosClient.post('/auth/logout');
        console.log('Logout response:', response);
        return response.data;
    } catch (error) {
        console.error('Logout failed:', error.response?.data || error.message);
        throw error;
    }


}