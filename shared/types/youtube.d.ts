declare global {
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

    export interface YoutubePlaylist {
        id: string;
        contentDetails: { itemCount: number };
        snippet: { title: string; thumbnails: Thumbnails; channelId: string; channelTitle: string };
        status: { privacyStatus: string };
    }

    interface YoutubeSubscription {
        id: string;
        snippet: { resourceId: { channelId: string } };
    }

    interface YoutubeChannel {
        id: string;
        snippet: { title: string; description: string; thumbnails: Thumbnails };
    }
}

export {};
