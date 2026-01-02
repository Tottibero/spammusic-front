import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useSpotifyAuthStore = defineStore('spotifyAuth', () => {
    const accessToken = ref<string | null>(localStorage.getItem('spotify_access_token'));
    const tokenExpiration = ref<number | null>(
        localStorage.getItem('spotify_token_expiration')
            ? Number(localStorage.getItem('spotify_token_expiration'))
            : null
    );

    const isConnected = computed(() => {
        if (!accessToken.value || !tokenExpiration.value) return false;
        return Date.now() < tokenExpiration.value;
    });

    function login() {
        const client_id = import.meta.env.VITE_CLIENT_ID;
        const redirect_uri = `${window.location.origin}/spotify/callback`;
        const scopes = [
            'playlist-modify-public',
            'playlist-modify-private',
            'playlist-read-private',
            'user-read-private',
            'user-read-email'
        ].join(' ');

        const url = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=token&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${encodeURIComponent(scopes)}&show_dialog=true`;

        window.location.href = url;
    }

    function handleCallback(hash: string) {
        const params = new URLSearchParams(hash.substring(1)); // Remove leading '#'
        const token = params.get('access_token');
        const expiresIn = params.get('expires_in');

        if (token && expiresIn) {
            setToken(token, parseInt(expiresIn));
            return true;
        }
        return false;
    }

    function setToken(token: string, expiresInSeconds: number) {
        accessToken.value = token;
        // Calculate expiration time (now + seconds * 1000)
        const expirationMs = Date.now() + (expiresInSeconds * 1000);
        tokenExpiration.value = expirationMs;

        localStorage.setItem('spotify_access_token', token);
        localStorage.setItem('spotify_token_expiration', String(expirationMs));
    }

    function logout() {
        accessToken.value = null;
        tokenExpiration.value = null;
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_token_expiration');
    }

    // Check expiration on init/actions
    function checkExpiration() {
        if (tokenExpiration.value && Date.now() > tokenExpiration.value) {
            logout();
        }
    }

    return {
        accessToken,
        isConnected,
        login,
        handleCallback,
        logout,
        checkExpiration
    };
});
