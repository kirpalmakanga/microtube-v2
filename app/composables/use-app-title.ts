export function useAppTitle(title: MaybeRef<string | null | undefined>) {
    useHead({
        title: computed(() => {
            const value = toValue(title);

            return `${value ? `${value} | ` : ''}Microtube`;
        })
    });
}
