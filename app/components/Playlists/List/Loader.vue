<template>
    <div>
        <UCard variant="soft" :ui="{ body: 'flex gap-4' }">
            <USkeleton class="aspect-video h-28" />

            <div class="flex flex-col grow"><USkeleton class="h-4 w-full" /></div>
        </UCard>
    </div>
</template>
