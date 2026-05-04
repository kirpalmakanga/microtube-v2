declare const SIZE_DEFAULT = 'default';
declare const SIZE_MEDIUM = 'medium';
declare const SIZE_HIGH = 'high';

declare global {
    interface Thumbnails {
        [key: string]: File;
        [SIZE_DEFAULT]: File;
        [SIZE_MEDIUM]: File;
        [SIZE_HIGH]: File;
    }

    interface User {
        id: string;
        name: string;
        picture: string;
        accessToken: string;
        refreshToken: string;
        idToken: string;
    }

    interface Playlist {
        id: string;
        title: string;
        thumbnails: Thumbnails;
        itemCount: number;
        privacyStatus: string;
        channelId: string;
        channelTitle: string;
    }

    interface Video {
        id: string;
        title: string;
        description: string;
        thumbnails: Thumbnails;
        duration: number;
        publishedAt: string;
        channelId: string;
        channelTitle: string;
        privacyStatus: string;
    }

    interface PlaylistItem extends Video {
        playlistId: string;
        playlistItemId: string;
    }

    interface Channel {
        id: string;
        title: string;
        thumbnails: Thumbnails;
    }
}

export {};
