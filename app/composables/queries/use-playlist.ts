import { getPlaylistItems, removePlaylistItem } from '~/services/youtube';

export function usePlaylistItems(playlistId: MaybeRef<string>) {
    return useInfiniteQuery({
        key: () => ['playlistItems', toValue(playlistId)],
        query: ({ pageParam: pageToken }) => {
            return getPlaylistItems({
                playlistId: toValue(playlistId),
                ...(pageToken ? { pageToken } : {})
            });
        },
        initialPageParam: undefined,
        getNextPageParam: ({ nextPageToken }) => {
            return nextPageToken;
        }
    });
}

export function useRemovePlaylistItem(playlistId: MaybeRef<string>) {
    const queryCache = useQueryCache();

    return useMutation({
        mutation: () => removePlaylistItem(toValue(playlistId)),
        onSuccess: () => {
            queryCache.invalidateQueries({
                key: ['playlistItems', toValue(playlistId)]
            });
        }
    });
}
