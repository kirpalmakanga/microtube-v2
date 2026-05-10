<template>
    <div class="flex bg-elevated/80 p-6 gap-6 shadow">
        <slot name="thumbnail" />

        <div class="flex flex-col grow gap-2 overflow-hidden">
            <slot name="content" />
        </div>
    </div>
</template>
