<template>
  <div
    class="editor-container"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="handleFileDrop"
  >
    <!-- Drag Overlay -->
    <div v-if="isDragging" class="drag-overlay">
      <div class="drag-content">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <span>Drop your .json file here</span>
      </div>
    </div>

    <!-- Top Toolbar -->
    <div class="editor-header">
      <div class="editor-title-group">
        <span class="panel-label">JSON Source</span>
        <span class="line-count-badge">{{ lineCount }} lines</span>
      </div>

      <div class="editor-actions">
        <!-- Paste from clipboard -->
        <button class="btn btn-ghost btn-sm" @click="handlePasteClipboard" title="Paste from clipboard">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          </svg>
          <span>Paste</span>
        </button>

        <!-- Upload File Button -->
        <label class="btn btn-ghost btn-sm file-upload-btn" title="Upload JSON file">
          <input type="file" accept=".json,.txt" @change="handleFileInput" class="hidden-file-input" />
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <span>Upload</span>
        </label>

        <!-- Copy raw JSON -->
        <button class="btn btn-ghost btn-sm" @click="handleCopyRaw" :disabled="!modelValue" title="Copy raw text">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>Copy</span>
        </button>
      </div>
    </div>

    <!-- Error Banner -->
    <div v-if="!isValid && parseError" class="error-banner">
      <div class="error-info">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span class="error-msg">
          <strong>Syntax Error:</strong> {{ parseError.message }}
          <span v-if="parseError.line"> (Line {{ parseError.line.lineNumber }}, Col {{ parseError.line.colNumber }})</span>
        </span>
      </div>
      <button class="btn btn-emerald btn-sm" @click="$emit('repair')">
        Fix with Auto Repair
      </button>
    </div>

    <!-- Textarea with Line Numbers -->
    <div class="editor-body">
      <div class="line-numbers" ref="lineNumbersRef">
        <div v-for="n in lineCount" :key="n" class="line-num">{{ n }}</div>
      </div>
      <textarea
        ref="textareaRef"
        class="code-textarea"
        :value="modelValue"
        @input="onInput"
        @scroll="syncScroll"
        @keydown="handleKeydown"
        placeholder="// Paste JSON, Drag & Drop a .json file, or pick a sample above..."
        spellcheck="false"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  isValid: {
    type: Boolean,
    default: true
  },
  parseError: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'repair', 'copied', 'toast'])

const isDragging = ref(false)
const textareaRef = ref(null)
const lineNumbersRef = ref(null)

const lineCount = computed(() => {
  if (!props.modelValue) return 1
  return props.modelValue.split('\n').length
})

function onInput(e) {
  emit('update:modelValue', e.target.value)
}

function syncScroll() {
  if (textareaRef.value && lineNumbersRef.value) {
    lineNumbersRef.value.scrollTop = textareaRef.value.scrollTop
  }
}

function handleKeydown(e) {
  // Support Tab indentation
  if (e.key === 'Tab') {
    e.preventDefault()
    const target = e.target
    const start = target.selectionStart
    const end = target.selectionEnd
    const value = target.value

    target.value = value.substring(0, start) + '  ' + value.substring(end)
    target.selectionStart = target.selectionEnd = start + 2
    emit('update:modelValue', target.value)
  }
}

async function handlePasteClipboard() {
  try {
    const text = await navigator.clipboard.readText()
    if (text) {
      emit('update:modelValue', text)
      emit('toast', 'Pasted from clipboard', 'success')
    }
  } catch (err) {
    emit('toast', 'Could not read clipboard', 'warning')
  }
}

async function handleCopyRaw() {
  if (!props.modelValue) return
  try {
    await navigator.clipboard.writeText(props.modelValue)
    emit('toast', 'Copied raw JSON to clipboard', 'success')
  } catch {
    emit('toast', 'Failed to copy', 'error')
  }
}

function handleFileInput(e) {
  const file = e.target.files?.[0]
  if (file) {
    readFile(file)
  }
}

function handleFileDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files?.[0]
  if (file) {
    readFile(file)
  }
}

function readFile(file) {
  const reader = new FileReader()
  reader.onload = (evt) => {
    const content = evt.target?.result
    if (typeof content === 'string') {
      emit('update:modelValue', content)
      emit('toast', `Loaded "${file.name}"`, 'success')
    }
  }
  reader.readAsText(file)
}
</script>

<style scoped>
.editor-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  position: relative;
  overflow: hidden;
}

.drag-overlay {
  position: absolute;
  inset: 0;
  background: rgba(13, 180, 158, 0.9);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
}

.drag-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.editor-header {
  height: var(--toolbar-height);
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface-elevated);
}

.editor-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}

.line-count-badge {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-subtle);
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.hidden-file-input {
  display: none;
}

.file-upload-btn {
  cursor: pointer;
}

.error-banner {
  background: rgba(244, 63, 94, 0.12);
  border-bottom: 1px solid rgba(244, 63, 94, 0.3);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--accent-rose);
  font-size: 12px;
}

.error-info {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.error-msg {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.editor-body {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

.line-numbers {
  width: 48px;
  padding: 12px 0;
  background: var(--bg-surface-elevated);
  border-right: 1px solid var(--border-subtle);
  text-align: right;
  user-select: none;
  overflow: hidden;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 20px;
  color: var(--text-subtle);
}

.line-num {
  padding-right: 12px;
}

.code-textarea {
  flex: 1;
  height: 100%;
  padding: 12px 16px;
  background: transparent;
  color: var(--text-main);
  border: none;
  outline: none;
  resize: none;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 20px;
  white-space: pre;
  tab-size: 2;
  overflow: auto;
}

.code-textarea::placeholder {
  color: var(--text-subtle);
  font-style: italic;
}
</style>
