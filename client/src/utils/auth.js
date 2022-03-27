import decode from 'jwt-decode';

class AuthService {
    // Retrieve data saved in token
    getProfile() {
        return decode(this.getToken());
    }

    // Check if the user is still logged in
    loggedIn() {
        // Checks if there is a saved token and that it's still valid
        const token = this.getToken();
        // Use type coersion to check if token is not undefined and not expired
        return !!token && !this.isTokenExpired(token);
    }

    // Check if the token has expired
    isTokenExpired(token) {
        try {
            const decoded = decode(token);
            if (decoded.exp < Date.now() / 1000) {
                return true;
            } else {
                return false
            }
        } catch (err) {
            return false;
        }
    }

    // Retrieve token from localStorage
    getToken() {
        // Retrieves the user token from localStorage
        return localStorage.getItem('id_token');
    }

    // Set token to localStorage and reload page to homepage
    login(idToken) {
        // Saves user token to localStorage
        localStorage.setItem('id_token', idToken);
        window.location.assign('/');
    }

    // Clear token from localStorage and force logout with reload
    logout() {
        // Clear user token and profile data from localStorage
        localStorage.removeItem('id_token');
        // This will reload the page and reset the state of the app
        window.location.assign('/');
    }
}

export default new AuthService();