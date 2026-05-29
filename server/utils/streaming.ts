import ytdl from '@distube/ytdl-core';
import FFmpeg from 'fluent-ffmpeg';
import { Readable, PassThrough } from 'stream';

interface StreamOptions {}

const defaultOptions = {
    videoFormat: 'mp4',
    quality: 'highest',
    audioFormat: 'mp3'
};

export function streamify(videoId: string, options?: StreamOptions) {
    const _options = {
        ...defaultOptions,
        ...(options || {}),
        filter(format) {
            return format.container === _options.videoFormat && format.audioBitrate;
        }
    };

    const video = ytdl(`https://youtube.com/watch?v=${videoId}`, _options);
    const { audioFormat } = _options;
    const stream = new PassThrough();
    const ffmpeg = new FFmpeg(video);

    process.nextTick(() => {
        const output = ffmpeg.format(audioFormat).pipe(stream);

        ffmpeg.once('error', (error) => stream.emit('error', error));
        output.once('error', (error) => {
            video.end();
            stream.emit('error', error);
        });
    });

    stream.video = video;
    stream.ffmpeg = ffmpeg;

    return new Readable().wrap(stream);
}
