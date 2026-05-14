import {
    createPlaylist,
    getPlaylists,
    removePlaylist,
    type GetPlaylistsReturn
} from '~/services/youtube';

export function usePlaylists(channelId?: MaybeRef<string>) {
    return useInfiniteQuery<GetPlaylistsReturn, {}, string | null>({
        key: () => ['playlists', toValue(channelId) || 'mine'],
        query: ({ pageParam: pageToken }) => {
            return getPlaylists({
                pageToken,
                ...(toValue(channelId) ? { channelId: toValue(channelId) } : { mine: true })
            });
        },
        initialPageParam: null,
        getNextPageParam: ({ nextPageToken }) => {
            return nextPageToken;
        }
    });
}

export function useCreateplaylist() {
    const router = useRouter();
    const toast = useToast();
    const queryCache = useQueryCache();

    return useMutation({
        mutation: (playlistFormData: { title: string; privacyStatus: string }) => {
            return createPlaylist(playlistFormData);
        },
        onSuccess: async ({ id, title }) => {
            toast.add({
                title: `Successfully created playlist "${title}"`,
                color: 'success',
                orientation: 'horizontal',
                actions: [
                    {
                        label: 'See list',
                        color: 'neutral',
                        async onClick() {
                            await router.push(`/playlist/${id}`);
                        }
                    }
                ]
            });

            await queryCache.invalidateQueries(
                {
                    key: ['playlists', 'mine'],
                    exact: true
                },
                'all'
            );
        },
        onError: (error, { title }) => {
            captureError(error);

            toast.add({ title: `Error: Failed to create playlist "${title}"`, color: 'error' });
        }
    });
}

export function useRemovePlaylist() {
    const toast = useToast();
    const queryCache = useQueryCache();

    return useMutation({
        mutation: async (playlist: Playlist) => {
            await removePlaylist(playlist.id);

            return playlist;
        },
        onSuccess: async ({ title }) => {
            toast.add({
                title: `Successfully removed playlist "${title}"`,
                color: 'success'
            });

            await queryCache.invalidateQueries({
                key: ['playlists', 'mine'],
                exact: true
            });
        },
        onError: (error, { title }) => {
            captureError(error);

            toast.add({ title: `Error: Failed to remove playlist "${title}"`, color: 'error' });
        }
    });
}
