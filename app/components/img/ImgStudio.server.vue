<script lang="ts" setup>
import type { CropConfig, StudioTool, ToolbarConfig, ZoomConfig, ExportConfig } from './types'

const props = withDefaults(defineProps<{
  src?: string
  accept?: string
  crop?: boolean | CropConfig
  zoom?: boolean | ZoomConfig
  toolbar?: boolean | ToolbarConfig
  export?: ExportConfig
  disabled?: boolean
}>(), {
  src: '',
  accept: 'image/*',
  crop: true,
  zoom: false,
  toolbar: true,
  disabled: false
})

const activeTool = defineModel<StudioTool>('activeTool', { default: 'none' })
</script>

<template>
  <div class="flex flex-col items-center justify-center w-full min-h-100 bg-gray-50/50 dark:bg-gray-900/50 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl animate-pulse">
    <UIcon name="i-lucide-image" class="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" />
    <span class="text-sm font-medium text-gray-400 dark:text-gray-500">Loading Image Studio...</span>
  </div>
</template>
