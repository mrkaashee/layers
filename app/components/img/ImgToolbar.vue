<script lang="ts" setup>
import type { StudioTool } from './types'

const props = defineProps<{
  activeTool: StudioTool
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:activeTool': [tool: StudioTool]
}>()

function toggleTool(tool: StudioTool) {
  if (props.disabled) return
  emit('update:activeTool', props.activeTool === tool ? 'none' : tool)
}
</script>

<template>
  <div class="img-toolbar">
    <!-- Built-in tools -->
    <UButton
      icon="i-lucide-crop"
      :color="activeTool === 'crop' ? 'primary' : 'neutral'"
      variant="ghost"
      :disabled="disabled"
      square
      class="toolbar-btn"
      :class="{ 'is-active': activeTool === 'crop' }"
      @click="toggleTool('crop')" />

    <UDivider class="my-2" />

    <!-- Slot for parent to inject extra tools -->
    <slot />
  </div>
</template>

<style scoped>
.img-toolbar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--ui-bg-elevated);
  border-right: 1px solid var(--ui-border);
  min-width: 4rem;
  z-index: 10;
}

.toolbar-btn {
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-lg);
}

.toolbar-btn.is-active {
  background: color-mix(in srgb, var(--ui-color-primary-500) 15%, transparent);
}
</style>
