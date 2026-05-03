<script setup lang="ts">
const route = useRoute();
const authStore = useAuthStore();
const { picture } = storeToRefs(authStore);
// import { useAppTitle } from '../store/app';
// import { useAuth } from '../store/user';

// const DefaultHeader = () => {
//     const location = useLocation();
//     const [user, { signIn, signOut }] = useAuth();
//     const [isMenuOpen, setMenuState] = createSignal(false);

//     const title = useAppTitle();

//     const handleClickUser = () => setMenuState(!isMenuOpen());

//     const handleLogging = () => {
//         if (user.isSignedIn) signOut();
//         else signIn();

//         setMenuState(false);
//     };
</script>

<template>
    <UHeader :toggle="false">
        <template #left>
            <NuxtLink class="flex items-center gap-1" to="/">
                <UIcon class="size-8" name="i-mdi-youtube" />

                <span class="font-bold">MicroTube</span>
            </NuxtLink>
        </template>

        <template #right>
            <!-- <UTooltip text="Open on GitHub">
                <UButton
                    to="https://github.com/nuxt-ui-templates/starter"
                    target="_blank"
                    icon="i-simple-icons-github"
                    aria-label="GitHub"
                    color="neutral"
                    variant="ghost"
                />
            </UTooltip> -->

            <SearchForm />

            <UColorModeButton />

            <UButton color="neutral" variant="ghost"><UAvatar :src="picture" /></UButton>
        </template>
    </UHeader>
</template>
