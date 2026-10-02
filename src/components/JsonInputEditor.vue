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
        <span>Drop your {{ language === 'json' ? '.json' : 'code' }} file here</span>
      </div>
    </div>

    <!-- Top Toolbar -->
    <div class="editor-header">
      <div class="editor-title-group">
        <span class="panel-label">{{ language === 'json' ? 'JSON Source' : `${langName} Editor` }}</span>
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
        <label class="btn btn-ghost btn-sm file-upload-btn" title="Upload file">
          <input
            type="file"
            accept=".json,.txt,.py,.js,.ts,.sql,.yaml,.yml,.go,.rs,.html,.css,.sh,.md,.java,.cpp,.cs,.php"
            @change="handleFileInput"
            class="hidden-file-input"
          />
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <span>Upload</span>
        </label>

        <!-- Copy raw code -->
        <button class="btn btn-ghost btn-sm" @click="handleCopyRaw" :disabled="!modelValue" title="Copy raw text">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>Copy</span>
        </button>
      </div>
    </div>

    <!-- Smart Auto-Detected Language Suggestion Banner -->
    <div v-if="suggestedLanguage && suggestedLanguage !== language" class="suggestion-banner">
      <div class="suggestion-info">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <span>Looks like <strong>{{ suggestedLangName }}</strong> code snippet!</span>
      </div>
      <div class="suggestion-actions">
        <button class="btn btn-emerald btn-sm" @click="applySuggestedLanguage">
          Switch to {{ suggestedLangName }}
        </button>
        <button class="btn btn-ghost btn-sm btn-icon-only" @click="dismissSuggestion" title="Dismiss">
          ✕
        </button>
      </div>
    </div>

    <!-- JSON Error Banner (Only in JSON mode) -->
    <div v-if="language === 'json' && !isValid && parseError" class="error-banner">
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
        :placeholder="editorPlaceholder"
        spellcheck="false"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getLanguageById, detectLanguage } from '../utils/languages'

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
  },
  language: {
    type: String,
    default: 'json'
  }
})

const emit = defineEmits(['update:modelValue', 'repair', 'copied', 'toast', 'change-language'])

const isDragging = ref(false)
const textareaRef = ref(null)
const lineNumbersRef = ref(null)
const suggestedLanguage = ref(null)
const dismissedSuggestionFor = ref('')

const langName = computed(() => getLanguageById(props.language).name)
const suggestedLangName = computed(() => suggestedLanguage.value ? getLanguageById(suggestedLanguage.value).name : '')

const lineCount = computed(() => {
  if (!props.modelValue) return 1
  return props.modelValue.split('\n').length
})

const editorPlaceholder = computed(() => {
  if (props.language === 'json') {
    return '// Paste JSON, Drag & Drop a .json file, or pick a sample above...'
  }
  return `// Paste or write ${langName.value} code here...`
})

// Auto-detect non-JSON code when pasted into JSON mode
watch(() => props.modelValue, (newVal) => {
  if (props.language === 'json' && newVal && newVal.trim().length > 15) {
    if (dismissedSuggestionFor.value === newVal.substring(0, 50)) return
    const detected = detectLanguage(newVal)
    if (detected && detected !== 'json') {
      suggestedLanguage.value = detected
      return
    }
  }
  suggestedLanguage.value = null
})

function applySuggestedLanguage() {
  if (suggestedLanguage.value) {
    emit('change-language', suggestedLanguage.value)
    emit('toast', `Switched to ${suggestedLangName.value} Snippet mode!`, 'success')
    suggestedLanguage.value = null
  }
}

function dismissSuggestion() {
  if (props.modelValue) {
    dismissedSuggestionFor.value = props.modelValue.substring(0, 50)
  }
  suggestedLanguage.value = null
}

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
    emit('toast', 'Copied text to clipboard', 'success')
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
      
      // Auto switch language based on file extension
      const ext = file.name.split('.').pop()?.toLowerCase()
      const extLangMap = {
        py: 'python',
        sql: 'sql',
        js: 'javascript',
        ts: 'typescript',
        yaml: 'yaml',
        yml: 'yaml',
        html: 'html',
        css: 'css',
        go: 'go',
        rs: 'rust',
        sh: 'bash',
        md: 'markdown',
        json: 'json',
        java: 'java',
        cpp: 'cpp',
        cs: 'csharp',
        php: 'php'
      }
      if (ext && extLangMap[ext]) {
        emit('change-language', extLangMap[ext])
      }
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
  padding: 2px 8px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  color: var(--text-subtle);
  font-family: var(--font-mono);
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.file-upload-btn {
  position: relative;
  cursor: pointer;
}

.hidden-file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
}

/* Suggestion Banner */
.suggestion-banner {
  background: linear-gradient(90deg, rgba(88, 166, 255, 0.15) 0%, rgba(13, 180, 158, 0.15) 100%);
  border-bottom: 1px solid rgba(88, 166, 255, 0.3);
  padding: 6px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-main);
  animation: fadeIn 0.15s ease;
}

.suggestion-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--accent-cyan);
}

.suggestion-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Error Banner */
.error-banner {
  background: rgba(244, 63, 94, 0.12);
  border-bottom: 1px solid rgba(244, 63, 94, 0.3);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  color: #fb7185;
}

.error-info {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
}

.error-msg {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.editor-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.line-numbers {
  width: 48px;
  padding: 12px 8px 12px 0;
  text-align: right;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 21px;
  color: var(--text-subtle);
  user-select: none;
  background: var(--bg-surface);
  border-right: 1px solid var(--border-subtle);
  overflow: hidden;
}

.line-num {
  height: 21px;
}

.code-textarea {
  flex: 1;
  padding: 12px 16px;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 21px;
  color: var(--text-main);
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  white-space: pre;
  overflow: auto;
  tab-size: 2;
}

.code-textarea::placeholder {
  color: var(--text-subtle);
}
</style>
