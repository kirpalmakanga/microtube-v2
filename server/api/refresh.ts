import { refreshAccessToken } from '../services/google';
import { badRequest } from '../utils/response';

export default defineEventHandler<{ query: { refreshToken: string } }>(async (event) => {
    const { origin } = getRequestURL(event);
    const { refreshToken } = getQuery(event);

    if (!origin) throw badRequest('Invalid origin');
    if (!refreshToken) throw badRequest('Invalid refresh token');

    return await refreshAccessToken({ origin, refreshToken });
});
