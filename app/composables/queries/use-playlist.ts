import {
    addPlaylistItem,
    getPlaylist,
    getPlaylistItems,
    removePlaylistItem
} from '~/services/youtube';

export function usePlaylist(playlistId: MaybeRef<string>) {
    return useQuery({
        key: () => ['playlist', toValue(playlistId)],
        query: () => getPlaylist(toValue(playlistId))
    });
}

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

export function useAddPlaylistItem() {
    const queryCache = useQueryCache();

    return useMutation({
        mutation: async ({ playlistId, videoId }: { playlistId: string; videoId: string }) => {
            await addPlaylistItem(playlistId, videoId);

            return { playlistId };
        },
        onSuccess: ({ playlistId }) => {
            queryCache.invalidateQueries({
                key: ['playlistItems', playlistId]
            });
        }
    });
}

export function useRemovePlaylistItem() {
    const queryCache = useQueryCache();

    return useMutation({
        mutation: async ({ playlistId, playlistItemId }: PlaylistItem) => {
            await removePlaylistItem(playlistItemId);

            return { playlistId };
        },
        onSuccess: ({ playlistId }) => {
            queryCache.invalidateQueries({
                key: ['playlistItems', playlistId]
            });
        }
    });
}
