import axios from 'axios';

export async function exchangeCodeForTokens(code: string): Promise<User> {
    const { data } = await axios.get('/api/token', {
        params: { code }
    });

    return data;
}

interface RefreshAccessTokenReturn {
    idToken: string;
    accessToken: string;
}

export async function refreshAccessToken(refreshToken: string): Promise<RefreshAccessTokenReturn> {
    const { data } = await axios.get('/api/refresh', {
        params: { refreshToken }
    });

    return data;
}
