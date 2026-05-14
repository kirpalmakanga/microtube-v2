import axios from 'axios';
import { parseVideoData, parsePlaylistData, parseChannelData } from './parsers';
import { parseVideoId, pick } from '~/utils/helpers';

interface SearchResultItem {
    id: { videoId: string };
}

const ITEMS_PER_REQUEST = 50;

export const instance = axios.create({
    baseURL: 'https://content.googleapis.com/youtube/v3'
});

export async function getAuthorizationUrl(): Promise<string> {
    const {
        data: { url }
    } = await axios.get('/api/authorization');

    return url;
}

export async function logIn(code: string): Promise<User> {
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

function removeEmptyParams(params: Record<string, unknown>) {
    for (const p in params) {
        if (!params[p]) {
            // FIXME: prevent false positives like 0
            delete params[p];
        }
    }
    return params;
}

const request = async (
    method: string,
    path: string,
    params?: Record<string, unknown>,
    data?: Record<string, unknown>
) => {
    const { data: result } = await instance({
        method,
        url: `/${path}`,
        data,
        params: params ? removeEmptyParams(params) : undefined
    });

    return result;
};

/* Videos */
export interface SearchVideosReturn {
    items: Video[];
    nextPageToken: string | null;
    totalResults: number;
}

export async function searchVideos({
    query,
    forMine,
    pageToken
}: {
    query: string;
    forMine: number;
    pageToken: string | null;
}): Promise<SearchVideosReturn> {
    const {
        items: searchResults,
        nextPageToken,
        pageInfo: { totalResults }
    } = await request('get', 'search', {
        part: 'id, snippet',
        type: 'video',
        q: query,
        forMine: !!forMine,
        pageToken,
        maxResults: ITEMS_PER_REQUEST
    });

    let items = [];

    if (searchResults.length) {
        const videoIds = searchResults.map(({ id: { videoId } }: SearchResultItem) => videoId);

        items = await getVideosFromIds(videoIds);
    }

    return {
        items,
        nextPageToken: items.length !== totalResults ? nextPageToken : null,
        totalResults
    };
}

export async function getVideo(urlOrId = '') {
    const { items } = await request('get', 'videos', {
        id: parseVideoId(urlOrId),
        part: 'contentDetails, snippet, status'
    });

    return parseVideoData(items[0]);
}

export async function getVideosFromIds(ids: string[]) {
    const { items } = await request('get', 'videos', {
        part: 'contentDetails, snippet, status',
        id: ids.join(','),
        maxResults: ITEMS_PER_REQUEST
    });

    return items.map(parseVideoData);
}

/* Playlists */

export interface GetPlaylistsReturn {
    items: Playlist[];
    nextPageToken: string;
    totalResults: number;
}

export async function getPlaylists({
    pageToken,
    mine = false,
    channelId = '',
    ids = []
}: {
    pageToken: string | null;
    mine?: boolean;
    channelId?: string;
    ids?: string[];
}): Promise<GetPlaylistsReturn> {
    const {
        items,
        nextPageToken,
        pageInfo: { totalResults }
    } = await request('get', 'playlists', {
        pageToken,
        mine,
        id: ids.join(','),
        channelId,
        part: 'snippet, contentDetails, status',
        maxResults: ITEMS_PER_REQUEST
    });

    return {
        items: items.map(parsePlaylistData),
        nextPageToken,
        totalResults
    };
}

export async function getAllPlaylists({ mine = false } = {}) {
    let pageToken = null;
    let stack = [];

    while (pageToken !== null) {
        const { items, nextPageToken } = await getPlaylists({
            pageToken,
            mine
        });

        pageToken = nextPageToken || null;
        stack.push(...items);
    }

    return {
        items: stack,
        nextPageToken: pageToken,
        totalResults: stack.length
    };
}

export async function createPlaylist({
    title,
    privacyStatus
}: {
    title: string;
    privacyStatus: string;
}) {
    const data = await request(
        'post',
        'playlists',
        {
            part: 'snippet,status,contentDetails'
        },
        {
            snippet: {
                title
            },
            status: {
                privacyStatus
            }
        }
    );

    return parsePlaylistData(data);
}

export async function removePlaylist(id: string) {
    return request('delete', 'playlists', {
        id
    });
}

export async function getPlaylist(id: string) {
    const {
        items: [item]
    } = await request('get', 'playlists', {
        id,
        part: 'snippet, contentDetails, status'
    });

    return parsePlaylistData(item);
}

export interface GetPlaylistItemsReturn {
    items: PlaylistItem[];
    nextPageToken: string;
    totalResults: number;
}

export async function getPlaylistItems({
    pageToken,
    playlistId
}: {
    pageToken: string | null;
    playlistId: string;
}): Promise<GetPlaylistItemsReturn> {
    const {
        items: playlistItems,
        nextPageToken,
        pageInfo: { totalResults }
    } = await request('get', 'playlistItems', {
        playlistId,
        pageToken,
        part: 'snippet, status',
        maxResults: ITEMS_PER_REQUEST
    });

    let items = [];

    if (playlistItems.length) {
        const videoIds = playlistItems.map(
            ({
                snippet: {
                    resourceId: { videoId }
                }
            }: {
                snippet: { resourceId: { videoId: string } };
            }) => videoId
        );

        const videos = await getVideosFromIds(videoIds);

        items = videos.map((data: Video, index: number) => ({
            ...data,
            playlistId,
            playlistItemId: playlistItems[index].id
        }));
    }

    return {
        items,
        nextPageToken,
        totalResults
    };
}

export async function getAllPlaylistItems(
    playlistId: string,
    onUpdate: (items: PlaylistItem[], totalResults: number) => void
): Promise<PlaylistItem[]> {
    async function getItemsRecursively(
        pageToken: string | null,
        gatheredItems: PlaylistItem[],
        onUpdate?: (items: PlaylistItem[], totalItems: number) => void
    ) {
        const { items, nextPageToken, totalResults } = await getPlaylistItems({
            playlistId,
            pageToken
        });

        gatheredItems.push(...items);

        onUpdate?.(gatheredItems, totalResults);

        if (nextPageToken) {
            await getItemsRecursively(nextPageToken, gatheredItems, onUpdate);
        }

        return gatheredItems;
    }

    return await getItemsRecursively(null, [], onUpdate);
}

export async function addPlaylistItem(playlistId: string, videoId: string): Promise<string> {
    const { id } = await request(
        'post',
        'playlistItems',
        { part: 'snippet' },
        {
            snippet: {
                playlistId,
                resourceId: {
                    kind: 'youtube#video',
                    videoId
                }
            }
        }
    );

    return id;
}

export async function removePlaylistItem(playlistItemId: string) {
    return request('delete', 'playlistItems', {
        id: playlistItemId
    });
}
/* Subscriptions */
async function getChannelsFromIds(ids: string[]) {
    const { items } = await request('get', 'channels', {
        part: 'snippet',
        id: ids.join(','),
        maxResults: ITEMS_PER_REQUEST
    });

    const channels = items.map(parseChannelData);

    return channels;
}

export async function getSubscriptions({ pageToken = '', mine = false }) {
    const {
        items: subscriptions,
        nextPageToken,
        pageInfo: { totalResults }
    } = await request('get', 'subscriptions', {
        pageToken,
        mine,
        part: 'id, snippet, contentDetails',
        maxResults: ITEMS_PER_REQUEST,
        order: 'alphabetical'
    });

    const channelIds = subscriptions.map(
        ({
            snippet: {
                resourceId: { channelId }
            }
        }: {
            snippet: {
                resourceId: { channelId: string };
            };
        }) => channelId
    );

    const channels = await getChannelsFromIds(channelIds);

    return {
        items: channels.map((data: Channel) => {
            const matchingSubscription = subscriptions.find(
                ({
                    snippet: {
                        resourceId: { channelId }
                    }
                }: {
                    snippet: {
                        resourceId: { channelId: string };
                    };
                }) => channelId === data.id
            );

            return {
                ...data,
                ...(matchingSubscription.id
                    ? {
                          subscriptionId: matchingSubscription.id,
                          ...pick(
                              matchingSubscription.contentDetails,
                              'totalItemCount',
                              'newItemCount'
                          )
                      }
                    : {}),
                isUnsubscribed: false
            };
        }),
        nextPageToken,
        totalResults
    };
}

/* Channels */
export async function getChannel(id: string): Promise<Channel> {
    const { items } = await request('get', 'channels', {
        id,
        part: 'snippet, contentDetails'
    });
    const {
        items: [{ id: subscriptionId } = {}]
    } = await request('get', 'subscriptions', {
        mine: true,
        forChannelId: id,
        part: 'id'
    });

    return { ...parseChannelData(items[0]), subscriptionId };
}

export interface GetChannelVideosReturn {
    items: Video[];
    nextPageToken: string | null;
    totalResults: number;
}

export async function getChannelVideos({
    channelId,
    pageToken
}: {
    channelId: string;
    pageToken: string | null;
}): Promise<GetChannelVideosReturn> {
    const { items, nextPageToken, pageInfo } = await request('get', 'search', {
        part: 'snippet',
        type: 'video',
        order: 'date',
        channelId,
        pageToken,
        maxResults: ITEMS_PER_REQUEST
    });

    const videoIds = items.map(({ id: { videoId } }: SearchResultItem) => videoId);

    const videos = await getVideosFromIds(videoIds);

    return {
        items: videos,
        nextPageToken,
        totalResults: pageInfo.totalResults
    };
}

export async function subscribeToChannel(channelId: string): Promise<string> {
    const { id } = await request(
        'post',
        'subscriptions',
        { part: 'snippet' },
        {
            snippet: {
                resourceId: {
                    kind: 'youtube#channel',
                    channelId
                }
            }
        }
    );

    return id;
}

export async function unsubscribeFromChannel(subscriptionId: string) {
    await request('delete', 'subscriptions', { id: subscriptionId });
}
