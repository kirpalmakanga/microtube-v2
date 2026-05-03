export function useAppTitle(title: MaybeRef<string>) {
    useHead({
        title: computed(() => {
            const value = toValue(title);

            return `${value ? `${value} | ` : ''}Microtube`;
        })
    });
}
