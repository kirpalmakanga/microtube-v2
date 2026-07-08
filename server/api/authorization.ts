import { getAuthorizationUrl } from '../services/google';
import { badRequest } from '../utils/response';

export default defineEventHandler(async (event) => {
    const { origin } = getRequestURL(event);

    if (origin) {
        const url = await getAuthorizationUrl(origin);

        return await sendRedirect(event, url);
    }

    badRequest('Invalid origin');
});
