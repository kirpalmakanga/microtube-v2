import { streamify } from '../utils/streaming';

export default defineEventHandler<{ query: { videoId: string } }>(async (event) => {
    const { videoId } = getQuery(event);

    if (!videoId) throw badRequest('Invalid video ID');

    const stream = await streamify(videoId);

    sendStream(event, stream);
});
