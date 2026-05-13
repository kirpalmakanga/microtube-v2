import { format } from 'date-fns';

export function captureError(error: unknown) {
    if (import.meta.env.DEV) {
        console.error(error);
    }
}

export const getThumbnails = (thumbnails: Thumbnails, size: string): string => {
    const { [size]: { url = '' } = {} } = thumbnails;

    return url.replace('http:', 'https:');
};

export const formatDate = (date: string, formatString: string) =>
    format(new Date(date), formatString);

export const parseDuration = (PT: string) => {
    if (!PT) {
        return 0;
    }

    const matches =
        PT.match(
            /P(?:(\d*)Y)?(?:(\d*)M)?(?:(\d*)W)?(?:(\d*)D)?T?(?:(\d*)H)?(?:(\d*)M)?(?:(\d*)S)?/i
        ) ?? [];

    const parts = [
        {
            // years
            pos: 1,
            multiplier: 86400 * 365
        },
        {
            // months
            pos: 2,
            multiplier: 86400 * 30
        },
        {
            // weeks
            pos: 3,
            multiplier: 604800
        },
        {
            // days
            pos: 4,
            multiplier: 86400
        },
        {
            // hours
            pos: 5,
            multiplier: 3600
        },
        {
            // minutes
            pos: 6,
            multiplier: 60
        },
        {
            // seconds
            pos: 7,
            multiplier: 1
        }
    ];

    let durationInSec = 0;

    for (const { pos, multiplier } of parts) {
        const { [pos]: time } = matches;

        if (time) {
            durationInSec += parseInt(time) * multiplier;
        }
    }

    return durationInSec;
};

export const formatTime = (t: number) => {
    const hours = Math.floor(t / 3600);
    const minutes = Math.floor((t - hours * 3600) / 60);
    const seconds = Math.floor(t - (hours * 3600 + minutes * 60));

    const units = [minutes, seconds];

    if (hours) units.unshift(hours);

    return units.map((unit) => `${unit}`.padStart(2, '0')).join(':');
};

export const isMobile = () => {
    const { userAgent } = navigator;

    return !!userAgent.match(/(Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone)/i);
};

export const parseVideoId = (url: string) => {
    const parts = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);

    // oxlint-disable-next-line no-useless-escape
    return parts[2] !== undefined ? parts[2].split(/[^0-9a-z_\-]/i)[0] : parts[0];
};

export const splitLines = (str: string) => str.match(/[^\r\n]+/g) || [];

export const chunk = (array: any[] = [], size: number) => {
    const chunks = [];

    let index = 0;

    while (index < array.length) {
        chunks.push(array.slice(index, size + index));

        index += size;
    }

    return chunks;
};

export function pick<T extends object, K extends keyof T>(base: T, ...keys: K[]): Pick<T, K> {
    if (!keys.length) return base;

    const entries = keys.map((key) => [key, base[key]]);

    return Object.fromEntries(entries);
}

export function omit<T extends object, K extends keyof T>(base: T, ...keys: K[]): Omit<T, K> {
    if (!keys.length) return base;

    const result = { ...base };

    for (const key of keys) delete result[key];

    return result;
}

export const wrapURLs = (text: string) => {
    // oxlint-disable-next-line no-useless-escape
    const urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

    // oxlint-disable-next-line no-useless-escape
    const pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

    const emailAddressPattern = /[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim;

    return text
        .replace(urlPattern, '<a href="$&" target="_blank">$&</a>')
        .replace(pseudoUrlPattern, '$1<a href="http://$2" target="_blank">$2</a>')
        .replace(emailAddressPattern, '<a href="mailto:$&">$&</a>');
};

export const loadScript = (src: string) => {
    if (document.querySelector(`script[src="${src}"]`)) {
        throw new Error(`Script already appended: ${src}`);
    }

    return new Promise((resolve, reject) => {
        const js = document.createElement('script');

        js.onload = resolve;
        js.onerror = reject;

        js.src = src;

        document.body.appendChild(js);
    });
};

export const getVideoURL = (id: string) => `${window.location.origin}/video/${id}`;

export const getPlaylistURL = (id: string) => `${window.location.origin}/playlist/${id}`;

interface ShareURLConfig {
    title: string;
    url: string;
}

export const shareURL = (config: ShareURLConfig) => navigator.share(config);

export function isEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;

    if (a == null || b == null) return a === b;

    if (typeof a !== typeof b) return false;

    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        return a.every((item, index) => isEqual(item, b[index]));
    }

    if (typeof a === 'object' && typeof b === 'object') {
        const keysA = Object.keys(a) as (keyof typeof a)[];
        const keysB = Object.keys(b) as (keyof typeof b)[];

        if (keysA.length !== keysB.length) return false;
        return keysA.every((key) => key in b && isEqual(a[key], b[key]));
    }

    return false;
}

export function limitNumberWithinRange(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}
