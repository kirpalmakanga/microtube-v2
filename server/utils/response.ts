import type { H3Event } from '#imports';

export function badRequest(message: string) {
    throw createError({
        status: 400,
        statusMessage: 'Bad Request',
        message
    });
}

export function sendStream(event: H3Event, stream: ReadableStream) {
    event._handled = true;

    if (event.node.res.socket) {
        stream.pipeTo(
            new WritableStream({
                write(chunk) {
                    event.node.res.write(chunk);
                },
                close() {
                    event.node.res.end();
                }
            })
        );
    }
}
