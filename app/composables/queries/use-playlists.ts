import { getPlaylists, removePlaylist } from '~/services/youtube';

export function usePlaylists(channelId?: MaybeRef<string>) {
    return useInfiniteQuery({
        key: () => ['playlists', toValue(channelId) || 'mine'],
        query: ({ pageParam: pageToken }) => {
            return getPlaylists({
                ...(pageToken ? { pageToken } : {}),
                ...(toValue(channelId) ? { channelId: toValue(channelId) } : { mine: true })
            });
        },
        initialPageParam: undefined,
        getNextPageParam: ({ nextPageToken }) => {
            return nextPageToken;
        }
    });
}

export function useRemovePlaylist(playlistId: MaybeRef<string>) {
    const queryCache = useQueryCache();

    return useMutation({
        mutation: () => removePlaylist(toValue(playlistId)),
        onSuccess: () => {
            queryCache.invalidateQueries({
                key: ['playlists', 'mine']
            });
        }
    });
}
