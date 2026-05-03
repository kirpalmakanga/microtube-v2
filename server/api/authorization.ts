import { getAuthorizationUrl } from '../core/google';
import { badRequest } from '../utils/response';

export default defineEventHandler(async (event) => {
    const { origin } = getRequestURL(event);

    if (origin) {
        const url = await getAuthorizationUrl(origin);

        return { url };
    }

    badRequest('Invalid origin');
});
