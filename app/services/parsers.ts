import { parseDuration } from '~/utils/helpers';

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
    snippet: { title, description, thumbnails }
}: YoutubeChannel): Channel => ({
    id,
    title,
    description,
    thumbnails
});
