<script lang="ts" setup>
import { ref, watch } from 'vue'
import type { AspectPreset, CropResult, StudioTool } from './types'
import ImgDropZone from './ImgDropZone.vue'
import ImgToolbar from './ImgToolbar.vue'
import ImgCropper from './ImgCropper.vue'

const props = withDefaults(defineProps<{
  src?: string
  accept?: string
  crop?: boolean
  cropAspect?: number | null
  cropPresets?: AspectPreset[]
  cropShape?: 'rect' | 'round'
  fixedCrop?: boolean
  disabled?: boolean
}>(), {
  src: '',
  accept: 'image/*',
  crop: true,
  cropAspect: null,
  cropPresets: () => [],
  cropShape: 'rect',
  fixedCrop: false
})

const emit = defineEmits<{
  'update:src': [dataUrl: string]
  'crop:apply': [result: CropResult]
  'crop:cancel': []
  reset: []
}>()

// --- State ---
const internalSrc = ref(props.src)
const activeTool = defineModel<StudioTool>('activeTool', { default: 'none' })
const isCropping = ref(activeTool.value === 'crop')

// Sync external src to internal
watch(() => props.src, val => {
  internalSrc.value = val
})

// Sync crop tool activation state
watch(activeTool, tool => {
  if (tool === 'crop' && !props.crop) {
    activeTool.value = 'none'
    return
  }
  isCropping.value = tool === 'crop'
})

// --- Handlers ---
function onImageLoad(dataUrl: string) {
  internalSrc.value = dataUrl
  emit('update:src', dataUrl)
}

function onCropApply(result: CropResult) {
  internalSrc.value = result.dataUrl
  activeTool.value = 'none'
  emit('crop:apply', result)
  emit('update:src', result.dataUrl) // Update the working image
}

function onCropCancel() {
  activeTool.value = 'none'
  emit('crop:cancel')
}

function onReset() {
  internalSrc.value = ''
  activeTool.value = 'none'
  emit('reset')
}
</script>

<template>
  <div class="img-studio" :class="{ 'is-disabled': disabled }">
    <!-- Empty State -->
    <template v-if="!internalSrc">
      <ImgDropZone
        :accept="accept"
        :disabled="disabled"
        @load="onImageLoad">
        <template #default>
          <slot name="empty" />
        </template>
      </ImgDropZone>
    </template>

    <!-- Studio Layout -->
    <template v-else>
      <div class="studio-layout">
        <!-- Sidebar -->
        <ImgToolbar
          v-model:active-tool="activeTool"
          :disabled="disabled">
          <slot name="toolbar" />
        </ImgToolbar>

        <!-- Main Display / Cropper -->
        <div class="studio-main">
          <!-- Background checked pattern -->
          <div class="bg-pattern" />

          <transition name="fade" mode="out-in">
            <!-- Cropper Mode -->
            <ImgCropper
              v-if="isCropping"
              :src="internalSrc"
              :crop-aspect="cropAspect"
              :crop-presets="cropPresets"
              :crop-shape="cropShape"
              :fixed-crop="fixedCrop"
              @apply="onCropApply"
              @cancel="onCropCancel" />

            <!-- Standard View -->
            <div v-else class="studio-view">
              <img :src="internalSrc" class="studio-img" alt="Studio Preview">
              <!-- Custom preview overlay slot -->
              <slot name="preview" :src="internalSrc" :crop="isCropping" />
            </div>
          </transition>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="studio-footer">
        <UButton
          label="Reset Image"
          icon="i-lucide-trash-2"
          color="neutral"
          variant="ghost"
          @click="onReset" />
        <div class="flex-1" />
        <!-- Custom actions slot -->
        <slot name="actions" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.img-studio {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 600px; /* Default height */
  min-height: 400px;
  background: var(--ui-bg);
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  position: relative;
}

.img-studio.is-disabled {
  opacity: 0.6;
  pointer-events: none;
}

.studio-layout {
  display: flex;
  flex: 1;
  min-height: 0;
}

.studio-main {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.bg-pattern {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(45deg, var(--ui-border) 25%, transparent 25%),
                    linear-gradient(-45deg, var(--ui-border) 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, var(--ui-border) 75%),
                    linear-gradient(-45deg, transparent 75%, var(--ui-border) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  opacity: 0.2;
  pointer-events: none;
}

.studio-view {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 1rem;
}

.studio-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.studio-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--ui-border);
  background: var(--ui-bg-elevated);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
