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
        onSuccess: ({ id, title }: Playlist) => {
            toast.add({
                title: `Playlist "${title}" created`,
                orientation: 'horizontal',
                actions: [
                    {
                        label: 'See list',
                        onClick() {
                            router.push(`/playlist/${id}`);
                        }
                    }
                ]
            });
        },
        onSettled: () => {
            queryCache.invalidateQueries({
                key: ['playlists', 'mine'],
                exact: true
            });
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
        onSuccess: ({ title }) => {
            toast.add({
                title: `Playlist "${title}" removed`,
                orientation: 'horizontal'
            });
        },
        onSettled: () => {
            queryCache.invalidateQueries({
                key: ['playlists', 'mine'],
                exact: true
            });
        }
    });
}
