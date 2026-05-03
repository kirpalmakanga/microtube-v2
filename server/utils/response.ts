export function badRequest(message: string) {
    throw createError({
        status: 400,
        statusMessage: 'Bad Request',
        message
    });
}
