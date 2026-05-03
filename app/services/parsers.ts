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
    snippet: { title: string; thumbnails: Thumbnails };
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
    status: { privacyStatus = 'deleted' }
}: YoutubeVideo): Video => ({
    id,
    title,
    description,
    thumbnails,
    duration: parseDuration(duration),
    publishedAt,
    channelId,
    channelTitle,
    privacyStatus
});

export const parsePlaylistData = ({
    id,
    contentDetails: { itemCount = 0 },
    snippet: { title, thumbnails },
    status: { privacyStatus }
}: YoutubePlaylist): Playlist => ({
    id,
    title,
    thumbnails,
    itemCount,
    privacyStatus
});

export const parseChannelData = ({
    id,
    snippet: { title, thumbnails }
}: YoutubeChannel): Channel => ({
    id,
    title,
    thumbnails
});
