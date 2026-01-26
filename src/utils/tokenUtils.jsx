const ACCESS_KEY = 'accessToken';

export const tokkenUtils = {

    // Store access token
    setAccessToken(token) {
        if (token) {
            localStorage.setItem(ACCESS_KEY, token);
            console.log('Access token stored successfully');    
        }
    } ,

    getAccessToken() {
        return localStorage.getItem(ACCESS_KEY);
    },

    clearAccessTokens() {
        localStorage.removeItem(ACCESS_KEY);
        console.log('Access token cleared successfully');
    },

    /**
     * Decode JWT to get payload (not verify signature)
     */
    decodeToken(token) {
        if (!token) return null;
        try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
        } catch {
        return null;
        }
    },

    /**
     * Get user information from token
     */
    getUserFromToken() {
        const token = this.getAccessToken();
        if (!token) return null;
        
        const decoded = this.decodeToken(token);
        if (!decoded) return null;

        return {
        userId: decoded.userId,
        email: decoded.email,
        fullName: decoded.fullName,
        role: decoded.role,
        };
    },

}