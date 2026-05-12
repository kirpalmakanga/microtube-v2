import {
    getChannel,
    getChannelVideos,
    subscribeToChannel,
    unsubscribeFromChannel,
    type GetChannelVideosReturn
} from '~/services/youtube';

export function useChannel(channelId: MaybeRef<string>) {
    return useQuery({
        key: () => ['channel', toValue(channelId)],
        query: () => getChannel(toValue(channelId))
    });
}

export function useChannelVideos(channelId: MaybeRef<string>) {
    return useInfiniteQuery<GetChannelVideosReturn, {}, string | null>({
        key: () => ['channel', toValue(channelId), 'videos'],
        query: ({ pageParam: pageToken }) => {
            return getChannelVideos({
                channelId: toValue(channelId),
                pageToken
            });
        },
        initialPageParam: null,
        getNextPageParam: ({ nextPageToken }) => {
            return nextPageToken;
        }
    });
}

export function useSubscribeToChannel() {
    const toast = useToast();
    const queryCache = useQueryCache();

    return useMutation({
        mutation: async ({ title, channelId }: { title: string; channelId: string }) => {
            await subscribeToChannel(channelId);

            return { title, channelId };
        },
        onSuccess: async ({ channelId }) => {
            await queryCache.invalidateQueries({
                key: ['channel', channelId]
            });
        },
        onError: (error, { title }) => {
            captureError(error);

            toast.add({
                title: `Error: Failed to subscribe to channel "${title}"`,
                color: 'error'
            });
        }
    });
}

export function useUnsubscribeFromChannel() {
    const toast = useToast();
    const queryCache = useQueryCache();

    return useMutation({
        mutation: async ({
            title,
            channelId,
            subscriptionId
        }: {
            title: string;
            channelId: string;
            subscriptionId: string;
        }) => {
            await unsubscribeFromChannel(subscriptionId);

            return { title, channelId };
        },
        onSuccess: async ({ channelId }) => {
            await queryCache.invalidateQueries({
                key: ['channel', channelId]
            });
        },
        onError: (error, { title }) => {
            captureError(error);

            toast.add({
                title: `Error: Failed to unsubscribe from channel "${title}"`,
                color: 'error'
            });
        }
    });
}
