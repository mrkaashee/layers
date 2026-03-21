<script lang="ts" setup>
import type { StudioTool, ToolbarConfig } from './types'

const props = withDefaults(defineProps<{
  activeTool: StudioTool
  disabled?: boolean
  config?: ToolbarConfig
}>(), {
  disabled: false,
  config: () => ({ show: true, items: ['crop', 'reset'] })
})

const emit = defineEmits<{
  'update:activeTool': [tool: StudioTool]
  action: [action: 'apply' | 'cancel' | 'reset']
}>()

function onToolClick(tool: StudioTool) {
  if (props.disabled) return
  if (tool === 'apply' || tool === 'cancel' || tool === 'reset') {
    emit('action', tool)
    return
  }
  emit('update:activeTool', props.activeTool === tool ? 'none' : tool)
}
</script>

<template>
  <div v-if="config.show" class="img-toolbar">
    <!-- Dynamic items based on config -->
    <template v-for="item in config.items" :key="item">
      <UButton
        v-if="item === 'crop'"
        icon="i-lucide-crop"
        :color="activeTool === 'crop' ? 'primary' : 'neutral'"
        variant="ghost"
        :disabled="disabled"
        square
        class="toolbar-btn"
        :class="{ 'is-active': activeTool === 'crop' }"
        @click="onToolClick('crop')" />

      <UButton
        v-if="item === 'cancel'"
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        :disabled="disabled || activeTool === 'none'"
        square
        class="toolbar-btn hover:text-red-500"
        @click="onToolClick('cancel')" />

      <UButton
        v-if="item === 'apply'"
        icon="i-lucide-check"
        color="primary"
        variant="soft"
        :disabled="disabled || activeTool === 'none'"
        square
        class="toolbar-btn"
        @click="onToolClick('apply')" />

      <UButton
        v-if="item === 'reset'"
        icon="i-lucide-trash-2"
        color="neutral"
        variant="ghost"
        :disabled="disabled"
        square
        class="toolbar-btn hover:text-red-500"
        @click="onToolClick('reset')" />
    </template>

    <USeparator v-if="config.items && config.items.length > 0" class="my-2" />

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
