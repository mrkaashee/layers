<script lang="ts" setup>
const props = withDefaults(defineProps<{
  accept?: string
  disabled?: boolean
}>(), {
  accept: 'image/*',
  disabled: false,
})

const emit = defineEmits<{
  load: [dataUrl: string]
}>()

// --- State ---
const isDragging = ref(false)
const urlInput = ref('')
const urlError = ref('')
const isLoadingUrl = ref(false)
const fileInputRef = ref<HTMLInputElement>()

// --- File reader helper ---
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Not an image file'))
      return
    }
    const reader = new FileReader()
    reader.onload = e => resolve(e.target!.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// --- Drag events ---
function onDragEnter(e: DragEvent) {
  e.preventDefault()
  if (!props.disabled) isDragging.value = true
}
function onDragOver(e: DragEvent) {
  e.preventDefault()
}
function onDragLeave(e: DragEvent) {
  // Only clear if leaving the zone entirely
  if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
    isDragging.value = false
  }
}
async function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  if (props.disabled) return
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  try {
    const dataUrl = await readFileAsDataUrl(file)
    emit('load', dataUrl)
  }
  catch {}
}

// --- File input ---
async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const dataUrl = await readFileAsDataUrl(file)
    emit('load', dataUrl)
  }
  catch {}
  // Reset so same file can be re-selected
  if (fileInputRef.value) fileInputRef.value.value = ''
}

// --- URL load ---
async function loadFromUrl() {
  urlError.value = ''
  const url = urlInput.value.trim()
  if (!url) return
  isLoadingUrl.value = true
  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Failed to load image from URL'))
      img.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    canvas.getContext('2d')!.drawImage(img, 0, 0)
    const dataUrl = canvas.toDataURL()
    emit('load', dataUrl)
    urlInput.value = ''
  }
  catch (err: unknown) {
    urlError.value = err instanceof Error ? err.message : 'Failed to load image'
  }
  finally {
    isLoadingUrl.value = false
  }
}
</script>

<template>
  <div
    class="img-drop-zone"
    :class="{ 'is-dragging': isDragging, 'is-disabled': disabled }"
    @dragenter="onDragEnter"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop">
    <!-- Hidden real file input -->
    <input
      ref="fileInputRef"
      type="file"
      :accept="accept"
      :disabled="disabled"
      class="sr-only"
      @change="onFileChange">

    <!-- Default slot or built-in drop zone UI -->
    <slot>
      <div class="drop-zone-inner">
        <div class="drop-icon">
          <UIcon name="i-lucide-image-up" class="size-12 text-primary-400" />
        </div>
        <p class="drop-title">
          Drop an image here
        </p>
        <p class="drop-sub">
          or
        </p>
        <UButton
          label="Choose File"
          icon="i-lucide-folder-open"
          variant="soft"
          :disabled="disabled"
          @click="fileInputRef?.click()" />

        <!-- URL input -->
        <div class="url-row">
          <UInput
            v-model="urlInput"
            placeholder="Paste image URL…"
            :disabled="disabled || isLoadingUrl"
            class="flex-1"
            @keydown.enter="loadFromUrl">
            <template #trailing>
              <UButton
                v-if="urlInput"
                icon="i-lucide-arrow-right"
                variant="ghost"
                size="xs"
                :loading="isLoadingUrl"
                @click="loadFromUrl" />
            </template>
          </UInput>
        </div>
        <p
          v-if="urlError"
          class="url-error">
          {{ urlError }}
        </p>
      </div>
    </slot>

    <!-- Drag overlay -->
    <Transition name="fade">
      <div
        v-if="isDragging"
        class="drag-overlay">
        <UIcon name="i-lucide-image-up" class="size-16" />
        <span>Drop to load</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.img-drop-zone {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--ui-border);
  border-radius: var(--radius-xl);
  background: var(--ui-bg-elevated);
  transition: border-color 0.2s, background 0.2s;
  overflow: hidden;
}

.img-drop-zone.is-dragging {
  border-color: var(--ui-color-primary-400);
  background: color-mix(in srgb, var(--ui-color-primary-500) 8%, transparent);
}

.img-drop-zone.is-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.drop-zone-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  text-align: center;
}

.drop-icon {
  width: 5rem;
  height: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--ui-color-primary-500) 10%, transparent);
  border-radius: var(--radius-full);
}

.drop-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--ui-text);
  margin: 0;
}

.drop-sub {
  font-size: 0.875rem;
  color: var(--ui-text-muted);
  margin: 0;
}

.url-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 24rem;
}

.url-error {
  font-size: 0.75rem;
  color: var(--ui-color-error-500);
  margin: 0;
}

/* Drag overlay */
.drag-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: color-mix(in srgb, var(--ui-color-primary-500) 15%, var(--ui-bg));
  backdrop-filter: blur(2px);
  color: var(--ui-color-primary-400);
  font-size: 1.25rem;
  font-weight: 600;
  border-radius: inherit;
  pointer-events: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
</style>
