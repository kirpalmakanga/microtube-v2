import { getSubscriptions, type GetSubscriptionsReturn } from '../../services/youtube';

export function useSubscriptions() {
    return useInfiniteQuery<GetSubscriptionsReturn, {}, string | null>({
        key: () => ['subscriptions'],
        query: ({ pageParam: pageToken }) => {
            return getSubscriptions({ pageToken, mine: true });
        },
        initialPageParam: null,
        getNextPageParam: ({ nextPageToken }) => nextPageToken
    });
}
