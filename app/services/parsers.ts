import { parseDuration } from '~/utils/helpers';

interface YoutubeVideo {
    id: string;
    contentDetails: { duration: string };
    snippet: {
        title: string;
        description: string;
        thumbnails: Thumbnails;
        channelId: string;
        channelTitle: string;
        publishedAt: string;
    };
    status: { privacyStatus: string };
}

interface YoutubePlaylist {
    id: string;
    contentDetails: { itemCount: number };
    snippet: { title: string; thumbnails: Thumbnails; channelId: string; channelTitle: string };
    status: { privacyStatus: string };
}

interface YoutubeChannel {
    id: string;
    snippet: { title: string; thumbnails: Thumbnails };
}

export const parseVideoData = ({
    id,
    contentDetails: { duration },
    snippet: { title, description, thumbnails, channelId, channelTitle, publishedAt },
    status: { privacyStatus }
}: YoutubeVideo): Video => ({
    id,
    title,
    description,
    thumbnails,
    duration: parseDuration(duration),
    publishedAt,
    channelId,
    channelTitle,
    privacyStatus: privacyStatus || 'deleted'
});

export const parsePlaylistData = ({
    id,
    contentDetails: { itemCount },
    snippet: { title, thumbnails, channelId, channelTitle },
    status: { privacyStatus }
}: YoutubePlaylist): Playlist => ({
    id,
    title,
    thumbnails,
    itemCount: itemCount || 0,
    privacyStatus,
    channelId,
    channelTitle
});

export const parseChannelData = ({
    id,
    snippet: { title, thumbnails }
}: YoutubeChannel): Channel => ({
    id,
    title,
    thumbnails
});
