<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui';

defineProps<{ menuOptions: ContextMenuItem[] }>();

const menuConfig = {
    align: 'end',
    side: 'bottom'
} as const;
</script>

<template>
    <UDropdownMenu v-if="menuOptions" :items="menuOptions" :content="menuConfig">
        <UButton
            class="ml-4"
            color="neutral"
            variant="ghost"
            icon="i-mdi-dots-vertical"
            size="lg"
            @click.stop
        />
    </UDropdownMenu>
</template>
