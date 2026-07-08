import {
    addPlaylistItem,
    getPlaylist,
    getPlaylistItems,
    hasPlaylistItem,
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
        mutation: async ({ video, playlist }: { video: Video; playlist: Playlist }) => {
            const isItemInPlaylist = await hasPlaylistItem(video.id, playlist.id);

            if (!isItemInPlaylist) {
                await addPlaylistItem(playlist.id, video.id);
            }

            return { video, playlist, isItemInPlaylist };
        },
        onSuccess: async ({ video: { thumbnails }, playlist: { id, title }, isItemInPlaylist }) => {
            if (isItemInPlaylist) {
                toast.add({
                    title: `"Already in playlist "${title}"`,
                    icon: 'i-mdi-information',
                    color: 'info'
                });

                return;
            }

            toast.add({
                title: `Added to playlist "${title}"`,
                color: 'success',
                avatar: {
                    src: getThumbnails(thumbnails, 'default'),
                    class: 'rounded-md aspect-video w-auto'
                }
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
                icon: 'i-mdi-close-circle',
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
                icon: 'i-mdi-check-circle',
                color: 'success'
            });

            await Promise.all([
                queryCache.invalidateQueries(
                    {
                        key: ['playlistItems', id],
                        exact: true
                    },
                    'all'
                ),
                queryCache.invalidateQueries(
                    {
                        key: ['playlist', id],
                        exact: true
                    },
                    'all'
                ),
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
                title: `Error: Failed to remove "${title}" from playlist`,
                icon: 'i-mdi-close-circle',
                color: 'error'
            });
        }
    });
}
