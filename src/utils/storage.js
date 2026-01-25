const AUTH_TOKEN_KEY = 'jwt'
const AUTH_USER_KEY = 'auth_user'
const ACCESS_TOKEN = 'access_token'


export function setAuthData(token) {
    try {
        localStorage.setItem(ACCESS_TOKEN, token)
        console.log('Access token stored successfully')
    } catch (error) {
        console.error('Failed to store Auth data:', error)
        throw new Error('Failed to save login data')
    }
}

export function updateAuthUser(updatedUser) {
    try {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser))
    } catch (error) {
        console.error('Failed to update Auth user:', error)
    }
}


export function clearAuthData() {
    try {
        localStorage.removeItem(ACCESS_TOKEN)
        // localStorage.removeItem(AUTH_USER_KEY)
        console.log('Auth data cleared successfully')
    } catch (error) {
        console.error('Failed to clear Auth data:', error)
    }
}

export function getAccessToken() {
    const token = localStorage.getItem(ACCESS_TOKEN)
    return token
}