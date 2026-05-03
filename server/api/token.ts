import { getProfile, getToken } from '../core/google';
import { badRequest } from '../utils/response';

export default defineEventHandler<{ query: { code: string } }>(async (event) => {
    const { origin } = getRequestURL(event);

    if (!origin) return badRequest('Invalid origin');

    const { code } = getQuery(event);

    if (!code) return badRequest('Authorization code required');

    const { accessToken, refreshToken, idToken } = await getToken({
        origin,
        code
    });

    const { id, name, picture } = await getProfile(accessToken);

    return {
        id,
        name,
        picture,
        accessToken,
        refreshToken,
        idToken
    };
});
