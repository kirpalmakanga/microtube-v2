import {
    addPlaylistItem,
    getPlaylist,
    getPlaylistItems,
    removePlaylistItem,
    type GetPlaylistItemsReturn
} from '~/services/youtube';

export function usePlaylist(playlistId: MaybeRef<string>) {
    return useQuery({
        key: () => ['playlist', toValue(playlistId)],
        query: () => getPlaylist(toValue(playlistId))
    });
}

export function usePlaylistItems(playlistId: MaybeRef<string>) {
    return useInfiniteQuery<GetPlaylistItemsReturn, {}, string | null>({
        key: () => ['playlistItems', toValue(playlistId)],
        query: ({ pageParam: pageToken }) => {
            return getPlaylistItems({
                playlistId: toValue(playlistId),
                pageToken
            });
        },
        initialPageParam: null,
        getNextPageParam: ({ nextPageToken }) => {
            return nextPageToken;
        }
    });
}

export function useAddPlaylistItem() {
    const toast = useToast();
    const queryCache = useQueryCache();

    return useMutation({
        mutation: async ({ videoId, playlist }: { videoId: string; playlist: Playlist }) => {
            await addPlaylistItem(playlist.id, videoId);

            return playlist;
        },

        onSuccess: async ({ id, title }) => {
            toast.add({
                title: `Added to playlist "${title}"`,
                orientation: 'horizontal'
            });

            await Promise.all([
                queryCache.invalidateQueries({
                    key: ['playlistItems', id]
                }),
                queryCache.invalidateQueries(
                    {
                        key: ['playlists', 'mine'],
                        exact: true
                    },
                    'all'
                )
            ]);
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
        onSuccess: async ({ playlistId }) => {
            await Promise.all([
                queryCache.invalidateQueries({
                    key: ['playlistItems', playlistId]
                }),
                queryCache.invalidateQueries(
                    {
                        key: ['playlists', 'mine'],
                        exact: true
                    },
                    'all'
                )
            ]);
        }
    });
}
