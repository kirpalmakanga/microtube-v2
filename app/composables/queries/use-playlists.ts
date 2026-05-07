import { createPlaylist, getPlaylists, removePlaylist } from '~/services/youtube';

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
    const queryCache = useQueryCache();

    return useMutation({
        mutation: ({ playlistId }: { playlistId: string }) => removePlaylist(playlistId),
        onSettled: () => {
            queryCache.invalidateQueries({
                key: ['playlists', 'mine'],
                exact: true
            });
        }
    });
}
