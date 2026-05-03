import { searchVideos } from '~/services/youtube';

export function useSearch(searchParams: MaybeRef<{ query: string; forMine: number }>) {
    return useInfiniteQuery({
        key: () => ['search'],
        query: ({ pageParam: pageToken }) => {
            return searchVideos({
                ...toValue(searchParams),
                ...(pageToken ? { pageToken } : {})
            });
        },
        initialPageParam: undefined,
        getNextPageParam: ({ nextPageToken }) => {
            return nextPageToken;
        }
    });
}
