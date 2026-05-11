const authRoutes = ['login', 'callback'];

export default defineNuxtRouteMiddleware(({ name }) => {
    const { isSignedIn } = useAuthStore();
    const isAuthRoute = authRoutes.includes(name as string);

    if (isAuthRoute && isSignedIn) return navigateTo('/');
    else if (!isAuthRoute && !isSignedIn) return navigateTo('/login');
});
