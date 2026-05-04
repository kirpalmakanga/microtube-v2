enum YoutubePlayerState {
    BUFFERING = 3,
    ENDED = 0,
    PAUSED = 2,
    PLAYING = 1,
    UNSTARTED = -1,
    VIDEO_CUED = 5
}

export type YoutubePlayerEvent =
    | 'onReady'
    | 'onStateChange'
    | 'onError'
    | 'onApiChange'
    | 'onVolumeChange';

export enum YoutubePlaybackState {
    UNSTARTED = -1
}

export interface YoutubePlayerOptions {
    width?: number | string;
    height?: number | string;
    videoId?: string;
    playerVars?: {
        autoplay?: 0 | 1;
        cc_lang_pref?: string;
        cc_load_policy?: 1;
        color?: 'red' | 'white';
        controls?: 0 | 1;
        disablekb?: 0 | 1;
        enablejsapi?: 0 | 1;
        end?: number;
        fs?: 0 | 1;
        hl?: string;
        iv_load_policy?: 1 | 3;
        list?: string;
        listType?: 'playlist' | 'search' | 'user_uploads';
        loop?: 0 | 1;
        modestbranding?: 1;
        origin?: string;
        playlist?: string;
        playsinline?: 0 | 1;
        rel?: 0 | 1;
        start?: number;
        widget_referrer?: string;
    };
    events?: {
        [eventType in YoutubePlayerEvent]?: (event: CustomEvent) => void;
    };
}

export interface YouTubePlayerInstance {
    addEventListener: (event: string, listener: (event: CustomEvent) => void) => void;
    destroy: () => void;
    getAvailablePlaybackRates: () => ReadonlyArray<number>;
    getAvailableQualityLevels: () => ReadonlyArray<string>;
    getCurrentTime: () => number;
    getDuration: () => number;
    getIframe: () => HTMLIFrameElement;
    getOption: (module: string, option: string) => any;
    getOptions: (module?: string) => object;
    setOption: (module: string, option: string, value: any) => void;
    setOptions: () => void;
    cuePlaylist: (playlist: {
        listType: string;
        list?: string;
        index?: number;
        startSeconds?: number;
        suggestedQuality?: string;
    }) => void;
    loadPlaylist: (playlist: {
        listType: string;
        list?: string;
        index?: number;
        startSeconds?: number;
        suggestedQuality?: string;
    }) => void;
    getPlaylist: () => ReadonlyArray<string>;
    getPlaylistIndex: () => number;
    getPlaybackQuality: () => string;
    getPlaybackRate: () => number;
    getPlayerState: () => YoutubePlayerState;
    getVideoEmbedCode: () => string;
    getVideoLoadedFraction: () => number;
    getVideoUrl: () => string;
    getVolume: () => number;
    cueVideoById: (video: {
        videoId: string;
        startSeconds?: number;
        endSeconds?: number;
        suggestedQuality?: string;
    }) => void;
    cueVideoByUrl: (video: {
        mediaContentUrl: string;
        startSeconds?: number;
        endSeconds?: number;
        suggestedQuality?: string;
    }) => void;

    loadVideoByUrl: (video: {
        mediaContentUrl: string;
        startSeconds?: number;
        endSeconds?: number;
        suggestedQuality?: string;
    }) => void;
    loadVideoById: (video: {
        videoId: string;
        startSeconds?: number;
        endSeconds?: number;
        suggestedQuality?: string;
    }) => void;
    isMuted: () => boolean;
    mute: () => void;
    nextVideo: () => void;
    pauseVideo: () => void;
    playVideo: () => void;
    playVideoAt: (index: number) => void;
    previousVideo: () => void;
    removeEventListener: (event: string, listener: (event: CustomEvent) => void) => void;
    seekTo: (seconds: number, allowSeekAhead: boolean) => void;
    setLoop: (loopPlaylists: boolean) => void;
    setPlaybackQuality: (suggestedQuality: string) => void;
    setPlaybackRate: (suggestedRate: number) => void;
    setShuffle: (shufflePlaylist: boolean) => void;
    setSize: (width: number, height: number) => object;
    setVolume: (volume: number) => void;
    stopVideo: () => void;
    unMute: () => void;
    on: (eventType: YoutubePlayerEvent, listener: (event: CustomEvent) => void) => void;
}

type YoutubePlayerConstructor = new (
    id: string,
    options: YoutubePlayerOptions
) => YouTubePlayerInstance;

type YoutubeIframeApi = {
    Player: YoutubePlayerConstructor;
};
declare global {
    interface Window {
        YT: { Player: YoutubePlayerConstructor };
        onYouTubeIframeAPIReady: () => void;
    }
}

export const EVENT_NAMES = [
    'ready',
    'stateChange',
    'playbackQualityChange',
    'playbackRateChange',
    'error',
    'apiChange',
    'volumeChange'
];

export const PLAYBACK_STATES = {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5
};

const loadYoutubeIframeAPI = async (): Promise<YoutubeIframeApi> => {
    if (window?.YT?.Player instanceof Function) {
        return window.YT;
    } else {
        await loadScript('https://www.youtube.com/iframe_api');

        return new Promise((resolve) => {
            window.onYouTubeIframeAPIReady = () => resolve(window.YT);
        });
    }
};

export const createYoutubePlayer = async (id: string, options: YoutubePlayerOptions) => {
    const YT = await loadYoutubeIframeAPI();

    return new YT.Player(id, options);
};
