<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

const router = useRouter();
const colorMode = useColorMode();

const authStore = useAuthStore();
const { isSignedIn, picture } = storeToRefs(authStore);
const { signOut } = authStore;

const isDark = computed({
    get() {
        return colorMode.value === 'dark';
    },
    set(_isDark) {
        colorMode.preference = _isDark ? 'dark' : 'light';
    }
});

const menuConfig = {
    align: 'end',
    side: 'bottom'
} as const;

const menuOptions = computed<DropdownMenuItem[]>(() => [
    {
        label: `Theme: ${isDark.value ? 'Dark' : 'Light'}`,
        icon: isDark.value ? 'i-mdi-moon-waning-crescent' : 'i-mdi-white-balance-sunny',
        onSelect: () => {
            isDark.value = !isDark.value;
        }
    },
    { type: 'separator' },
    {
        label: 'Sign out',
        icon: 'i-mdi-sign-out',
        color: 'error',
        onSelect: async () => {
            await signOut();

            await router.push('/login');
        }
    }
]);
</script>

<template>
    <UHeader :toggle="false">
        <template #left>
            <NuxtLink class="flex items-center gap-1" to="/">
                <UIcon class="size-8" name="i-mdi-youtube" />

                <span class="font-bold">MicroTube</span>
            </NuxtLink>
        </template>

        <template v-if="isSignedIn" #right>
            <SearchForm />

            <UDropdownMenu :content="menuConfig" :items="menuOptions">
                <button><UAvatar :src="picture" /></button>
            </UDropdownMenu>
        </template>
    </UHeader>
</template>
