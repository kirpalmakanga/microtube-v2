import { AuthPlus, oauth2 } from 'googleapis/build/src/apis/oauth2/index';

const { OAuth2 } = new AuthPlus();

const { CLIENT_ID, CLIENT_SECRET } = process.env;

function getClient({
    redirectUri,
    credentials
}: {
    redirectUri?: string;
    credentials?: { access_token: string } | { refresh_token: string };
}) {
    let options;

    if (redirectUri) {
        options = {
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            redirectUri
        };
    }

    const client = new OAuth2(options);

    if (credentials) client.setCredentials(credentials);

    return client;
}

export async function getAuthorizationUrl(origin: string) {
    const client = getClient({ redirectUri: `${origin}/callback` });

    const url = client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: [
            'openid',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/youtube'
        ]
    });

    return url;
}

export async function getToken({ origin, code }: { origin: string; code: string }) {
    const client = getClient({ redirectUri: `${origin}/callback` });

    const {
        tokens: { access_token: accessToken, refresh_token: refreshToken, id_token: idToken }
    } = await client.getToken(code);

    return {
        accessToken: accessToken as string,
        refreshToken: refreshToken as string,
        idToken: idToken as string
    };
}

export function refreshAccessToken({
    origin,
    refreshToken
}: {
    origin: string;
    refreshToken: string;
}) {
    const client = getClient({
        redirectUri: `${origin}/callback`,
        credentials: {
            refresh_token: refreshToken
        }
    });

    return new Promise((resolve, reject) => {
        client.refreshAccessToken((error, tokens) => {
            if (error) {
                reject(error);
            } else {
                if (tokens) {
                    const { id_token: idToken, access_token: accessToken } = tokens;

                    resolve({ idToken, accessToken });
                } else reject(new Error("Couldn't retrieve credentials"));
            }
        });
    });
}

export async function getProfile(accessToken: string) {
    const client = getClient({ credentials: { access_token: accessToken } });

    const auth = oauth2({
        auth: client,
        version: 'v2'
    });

    const { data } = await auth.userinfo.get();

    return data;
}
