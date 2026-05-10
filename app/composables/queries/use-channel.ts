import { getChannel, getChannelVideos, type GetChannelVideosReturn } from '~/services/youtube';

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
