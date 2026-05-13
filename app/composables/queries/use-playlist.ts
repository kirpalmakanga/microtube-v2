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
                color: 'success'
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
        },
        onError: (error, { playlist: { title } }) => {
            captureError(error);

            toast.add({
                title: `Error: Failed to add item to playlist "${title}"`,
                color: 'error'
            });
        }
    });
}

export function useRemovePlaylistItem() {
    const toast = useToast();
    const queryCache = useQueryCache();

    return useMutation({
        mutation: async ({ playlist, video }: { playlist: Playlist; video: PlaylistItem }) => {
            await removePlaylistItem(video.playlistItemId);

            return { playlist, video };
        },
        onSuccess: async ({ playlist: { id }, video: { title } }) => {
            toast.add({
                title: `Successfully removed "${title}" from playlist`,
                color: 'success'
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
        },
        onError: (error, { video: { title } }) => {
            captureError(error);

            toast.add({
                title: `Error: Failed remove "${title}" from playlist`,
                color: 'error'
            });
        }
    });
}
