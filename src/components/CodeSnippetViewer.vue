<template>
  <div class="code-viewer-container">
    <!-- Snippet Header & Action Bar -->
    <div class="viewer-toolbar">
      <div class="toolbar-left">
        <div class="language-badge">
          <span class="lang-dot"></span>
          <span class="lang-name">{{ languageInfo.name }}</span>
          <span class="lang-ext">{{ languageInfo.ext }}</span>
        </div>
        <div class="stat-pill">
          <span>{{ lineCount }} lines</span>
          <span class="stat-sep">·</span>
          <span>{{ formattedSize }}</span>
        </div>
      </div>

      <div class="toolbar-right">
        <!-- Search within snippet -->
        <div class="search-box-wrapper" :class="{ 'search-open': showSearch }">
          <button
            class="btn btn-ghost btn-sm btn-icon-only"
            @click="toggleSearch"
            :title="showSearch ? 'Close search' : 'Find in snippet (⌘F)'"
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <input
            v-if="showSearch"
            ref="searchInputRef"
            type="text"
            v-model="searchQuery"
            placeholder="Find in code..."
            class="search-input"
            @keydown.esc="showSearch = false"
          />
        </div>

        <!-- Wrap lines toggle -->
        <button
          class="btn btn-ghost btn-sm"
          :class="{ 'btn-active': wrapLines }"
          @click="wrapLines = !wrapLines"
          title="Toggle line wrapping"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="17 10 21 14 17 18"></polyline>
            <path d="M3 6h18"></path>
            <path d="M3 14h15a3 3 0 0 1 0 6H3"></path>
          </svg>
          <span>{{ wrapLines ? 'Wrap On' : 'Wrap Off' }}</span>
        </button>

        <!-- Download code file -->
        <button
          class="btn btn-ghost btn-sm"
          @click="downloadSnippet"
          :disabled="!code"
          :title="`Download as snippet${languageInfo.ext}`"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Download</span>
        </button>

        <!-- Copy Snippet -->
        <button
          class="btn btn-primary btn-sm"
          @click="copySnippet"
          :disabled="!code"
          title="Copy code to clipboard"
        >
          <svg v-if="!isCopied" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{{ isCopied ? 'Copied!' : 'Copy Snippet' }}</span>
        </button>
      </div>
    </div>

    <!-- Code Display Area -->
    <div class="code-viewport" :class="{ 'wrap-text': wrapLines }">
      <div v-if="!code" class="empty-state">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
        <p>No code snippet to display</p>
        <span>Paste or type code in the editor on the left</span>
      </div>

      <div v-else class="code-wrapper">
        <!-- Line Numbers Column -->
        <div class="line-numbers-col" aria-hidden="true">
          <div
            v-for="(line, idx) in lines"
            :key="idx"
            class="line-num-item"
            :class="{ 'line-highlight': highlightedLineIndex === idx }"
            @click="selectLine(idx)"
          >
            {{ idx + 1 }}
          </div>
        </div>

        <!-- Highlighted Code Body -->
        <div class="code-lines-col">
          <div
            v-for="(line, idx) in lines"
            :key="idx"
            class="code-line-row"
            :class="{
              'line-highlight': highlightedLineIndex === idx,
              'search-match': isLineSearchMatch(line)
            }"
            @click="selectLine(idx)"
          >
            <span class="code-line-text" v-html="highlightLine(line)"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { getLanguageById } from '../utils/languages'
import { highlightCode } from '../utils/highlighter'
import { formatBytes } from '../utils/jsonUtils'

const props = defineProps({
  code: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'javascript'
  }
})

const emit = defineEmits(['toast'])

const wrapLines = ref(false)
const showSearch = ref(false)
const searchQuery = ref('')
const searchInputRef = ref(null)
const isCopied = ref(false)
const highlightedLineIndex = ref(-1)

const languageInfo = computed(() => {
  return getLanguageById(props.language)
})

const lines = computed(() => {
  if (!props.code) return []
  return props.code.split('\n')
})

const lineCount = computed(() => lines.value.length)

const formattedSize = computed(() => {
  const bytes = new Blob([props.code || '']).size
  return formatBytes(bytes)
})

function highlightLine(lineText) {
  if (!lineText) return '&nbsp;'
  return highlightCode(lineText, props.language)
}

function isLineSearchMatch(lineText) {
  if (!showSearch.value || !searchQuery.value.trim()) return false
  return lineText.toLowerCase().includes(searchQuery.value.trim().toLowerCase())
}

function selectLine(idx) {
  if (highlightedLineIndex.value === idx) {
    highlightedLineIndex.value = -1
  } else {
    highlightedLineIndex.value = idx
  }
}

function toggleSearch() {
  showSearch.value = !showSearch.value
  if (showSearch.value) {
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  } else {
    searchQuery.value = ''
  }
}

async function copySnippet() {
  if (!props.code) return
  try {
    await navigator.clipboard.writeText(props.code)
    isCopied.value = true
    emit('toast', 'Code snippet copied to clipboard!', 'success')
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    emit('toast', 'Failed to copy code snippet', 'error')
  }
}

function downloadSnippet() {
  if (!props.code) return
  try {
    const filename = `snippet${languageInfo.value.ext}`
    const blob = new Blob([props.code], { type: languageInfo.value.mime || 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    emit('toast', `Downloaded ${filename}`, 'success')
  } catch (err) {
    emit('toast', 'Failed to download file', 'error')
  }
}
</script>

<style scoped>
.code-viewer-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  overflow: hidden;
}

.viewer-toolbar {
  height: var(--toolbar-height);
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface-elevated);
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.language-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  background: rgba(13, 180, 158, 0.12);
  border: 1px solid rgba(13, 180, 158, 0.3);
  border-radius: var(--radius-full);
}

.lang-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--accent-primary);
  box-shadow: 0 0 6px var(--accent-primary);
}

.lang-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-primary);
}

.lang-ext {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-muted);
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.stat-sep {
  opacity: 0.5;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-box-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.search-input {
  background: var(--bg-surface);
  border: 1px solid var(--border-focus);
  color: var(--text-main);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  width: 140px;
  outline: none;
  animation: fadeIn 0.15s ease;
}

.btn-active {
  background: var(--bg-surface-hover);
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.code-viewport {
  flex: 1;
  overflow: auto;
  position: relative;
  background: var(--bg-surface);
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-subtle);
  padding: 40px;
  text-align: center;
}

.empty-state p {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-muted);
}

.empty-state span {
  font-size: 12px;
}

.code-wrapper {
  display: flex;
  min-width: 100%;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
  padding: 12px 0;
}

.line-numbers-col {
  user-select: none;
  text-align: right;
  padding: 0 16px 0 12px;
  color: var(--text-subtle);
  border-right: 1px solid var(--border-subtle);
  min-width: 48px;
}

.line-num-item {
  height: 21px;
  line-height: 21px;
  cursor: pointer;
  transition: color 0.1s ease;
}

.line-num-item:hover {
  color: var(--text-main);
}

.code-lines-col {
  flex: 1;
  padding: 0 16px;
  overflow-x: auto;
}

.code-line-row {
  height: 21px;
  line-height: 21px;
  white-space: pre;
  transition: background-color 0.1s ease;
}

.wrap-text .code-line-row {
  white-space: pre-wrap;
  word-break: break-word;
  height: auto;
  min-height: 21px;
}

.code-line-row:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.line-highlight {
  background-color: rgba(13, 180, 158, 0.15) !important;
  border-left: 2px solid var(--accent-primary);
  color: var(--text-main);
}

.search-match {
  background-color: rgba(251, 191, 36, 0.2) !important;
}

.code-line-text {
  display: inline-block;
}

/* Prism Token Highlighting Colors using Design System */
:deep(.token.comment),
:deep(.token.prolog),
:deep(.token.doctype),
:deep(.token.cdata) {
  color: #64748b;
  font-style: italic;
}

:deep(.token.punctuation) {
  color: #94a3b8;
}

:deep(.token.property),
:deep(.token.tag),
:deep(.token.boolean),
:deep(.token.number),
:deep(.token.constant),
:deep(.token.symbol),
:deep(.token.deleted) {
  color: #f472b6;
}

:deep(.token.selector),
:deep(.token.attr-name),
:deep(.token.string),
:deep(.token.char),
:deep(.token.builtin),
:deep(.token.inserted) {
  color: #86efac;
}

:deep(.token.operator),
:deep(.token.entity),
:deep(.token.url),
:deep(.language-css .token.string),
:deep(.style .token.string) {
  color: #38bdf8;
}

:deep(.token.atrule),
:deep(.token.attr-value),
:deep(.token.keyword) {
  color: #a78bfa;
  font-weight: 500;
}

:deep(.token.function),
:deep(.token.class-name) {
  color: #5eead4;
}

:deep(.token.regex),
:deep(.token.important),
:deep(.token.variable) {
  color: #fde047;
}

:deep(.token.important),
:deep(.token.bold) {
  font-weight: bold;
}

:deep(.token.italic) {
  font-style: italic;
}
</style>
