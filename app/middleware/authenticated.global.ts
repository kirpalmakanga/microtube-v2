const authRoutes = ['login', 'callback'];

export default defineNuxtRouteMiddleware(({ name }) => {
    const { isSignedIn } = storeToRefs(useAuthStore());
    const isAuthRoute = authRoutes.includes(name as string);

    if (isAuthRoute && isSignedIn.value) return navigateTo('/');
    else if (!isAuthRoute && !isSignedIn.value) return navigateTo('/login');
});
