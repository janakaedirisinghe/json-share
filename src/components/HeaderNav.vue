<template>
  <header class="header-nav">
    <div class="header-left">
      <div class="brand" @click="$emit('reset-view')">
        <div class="brand-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
        </div>
        <div class="brand-info">
          <span class="brand-title">JSON<span class="brand-accent">Share</span></span>
          <span class="brand-tag">v1.1</span>
        </div>
      </div>

      <!-- Language Selector Dropdown -->
      <div class="dropdown-wrapper">
        <button class="btn btn-ghost btn-sm dropdown-btn lang-select-btn" @click="toggleLangMenu">
          <span class="lang-indicator-dot" :class="{ 'dot-json': language === 'json' }"></span>
          <span class="lang-btn-name">{{ currentLangObj.name }}</span>
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <div v-if="showLangMenu" class="dropdown-menu lang-dropdown-menu">
          <div class="dropdown-section-title">Primary Format</div>
          <div
            class="dropdown-item"
            :class="{ active: language === 'json' }"
            @click="chooseLanguage('json')"
          >
            <div class="lang-item-row">
              <span class="lang-item-title">JSON</span>
              <span class="lang-item-badge">Full Suite</span>
            </div>
            <div class="lang-item-desc">Tree, Graph, Table, Types & Diff</div>
          </div>

          <div class="dropdown-divider"></div>
          <div class="dropdown-section-title">Code Snippets</div>
          <div class="lang-grid">
            <div
              v-for="lang in snippetLanguages"
              :key="lang.id"
              class="lang-grid-item"
              :class="{ active: language === lang.id }"
              @click="chooseLanguage(lang.id)"
            >
              <span class="grid-item-name">{{ lang.name }}</span>
              <span class="grid-item-ext">{{ lang.ext }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Sample Loader -->
      <div class="dropdown-wrapper">
        <button class="btn btn-ghost btn-sm dropdown-btn" @click="toggleSamplesMenu">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>Samples</span>
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <div v-if="showSamplesMenu" class="dropdown-menu">
          <div
            v-for="sample in SAMPLES"
            :key="sample.id"
            class="dropdown-item"
            @click="selectSample(sample.id)"
          >
            <div class="sample-title">{{ sample.title }}</div>
            <div class="sample-desc">{{ sample.description }}</div>
          </div>
        </div>
      </div>

      <!-- Live JSON / Snippet Stats Pill -->
      <div v-if="hasContent" class="stats-pill" :class="{ 'stats-invalid': language === 'json' && !isValid }">
        <span class="status-dot"></span>
        <span v-if="language === 'json'">
          <span v-if="isValid">{{ stats.formattedSize }} · {{ stats.keyCount }} keys · Depth {{ stats.maxDepth }}</span>
          <span v-else>Malformed JSON</span>
        </span>
        <span v-else>
          <span>{{ stats.formattedSize }} · {{ lineCount }} lines</span>
        </span>
      </div>
    </div>

    <div class="header-right">
      <!-- Formatter Actions for JSON -->
      <div v-if="language === 'json'" class="action-group">
        <button
          class="btn btn-ghost btn-sm"
          @click="$emit('format', 2)"
          title="Format with 2 spaces"
          :disabled="!hasContent"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="21" y1="10" x2="7" y2="10"></line>
            <line x1="21" y1="6" x2="3" y2="6"></line>
            <line x1="21" y1="14" x2="3" y2="14"></line>
            <line x1="21" y1="18" x2="7" y2="18"></line>
          </svg>
          <span>Prettify</span>
        </button>

        <button
          class="btn btn-ghost btn-sm"
          @click="$emit('minify')"
          title="Minify JSON (single line)"
          :disabled="!hasContent"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="4 14 10 14 10 20"></polyline>
            <polyline points="20 10 14 10 14 4"></polyline>
            <line x1="14" y1="10" x2="21" y2="3"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
          <span>Minify</span>
        </button>

        <button
          v-if="!isValid && hasContent"
          class="btn btn-emerald btn-sm"
          @click="$emit('repair')"
          title="Auto-repair trailing commas, single quotes & Python formatting"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 14 5-5-5-5"></path>
            <path d="M4 20v-7a4 4 0 0 1 4-4h12"></path>
          </svg>
          <span>Auto Repair</span>
        </button>
      </div>

      <!-- Actions for Code Snippet (non-JSON) -->
      <div v-else class="action-group">
        <button
          class="btn btn-ghost btn-sm"
          @click="$emit('load-lang-sample')"
          title="Load sample code for this language"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <span>Load Snippet</span>
        </button>
      </div>

      <button
        v-if="hasContent"
        class="btn btn-ghost btn-sm"
        @click="$emit('clear')"
        title="Clear all"
      >
        <span>Clear</span>
      </button>

      <div class="divider"></div>

      <!-- Bookmarklet Modal Toggle -->
      <button
        class="btn btn-ghost btn-sm"
        @click="$emit('open-bookmarklet')"
        title="Install Browser Bookmarklet"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="hide-mobile">Bookmarklet</span>
      </button>

      <!-- History Drawer Toggle -->
      <button
        class="btn btn-ghost btn-sm"
        @click="$emit('open-history')"
        title="Saved Snippets & History"
      >
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span class="hide-mobile">History</span>
      </button>

      <!-- Theme Switcher -->
      <button
        class="btn btn-ghost btn-icon-only"
        @click="toggleTheme"
        :title="currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
      >
        <svg v-if="currentTheme === 'dark'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </button>

      <!-- Primary Share Button -->
      <button
        class="btn btn-primary"
        @click="$emit('open-share')"
        :disabled="!hasContent"
      >
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
          <polyline points="16 6 12 2 8 6"></polyline>
          <line x1="12" y1="2" x2="12" y2="15"></line>
        </svg>
        <span>Share {{ language === 'json' ? 'JSON' : 'Snippet' }}</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { SAMPLES } from '../utils/samples'
import { SUPPORTED_LANGUAGES, getLanguageById } from '../utils/languages'
import { useTheme } from '../composables/useTheme'

const props = defineProps({
  hasContent: Boolean,
  isValid: Boolean,
  stats: Object,
  language: {
    type: String,
    default: 'json'
  },
  lineCount: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits([
  'format',
  'minify',
  'repair',
  'clear',
  'load-sample',
  'load-lang-sample',
  'select-language',
  'open-share',
  'open-history',
  'open-bookmarklet',
  'reset-view'
])

const { currentTheme, toggleTheme } = useTheme()
const showSamplesMenu = ref(false)
const showLangMenu = ref(false)

const currentLangObj = computed(() => getLanguageById(props.language))
const snippetLanguages = computed(() => SUPPORTED_LANGUAGES.filter(l => l.id !== 'json'))

function toggleLangMenu() {
  showLangMenu.value = !showLangMenu.value
  showSamplesMenu.value = false
}

function toggleSamplesMenu() {
  showSamplesMenu.value = !showSamplesMenu.value
  showLangMenu.value = false
}

function chooseLanguage(langId) {
  emit('select-language', langId)
  showLangMenu.value = false
}

function selectSample(id) {
  emit('load-sample', id)
  showSamplesMenu.value = false
}
</script>

<style scoped>
.header-nav {
  height: var(--header-height);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: relative;
  z-index: 50;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.brand-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, #0db49e 0%, #099280 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(13, 180, 158, 0.4);
}

.brand-info {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.brand-title {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--text-main);
}

.brand-accent {
  color: var(--accent-primary);
}

.brand-tag {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  background-color: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  color: var(--text-muted);
}

/* Language Selector Dropdown */
.lang-select-btn {
  border-color: rgba(13, 180, 158, 0.3);
  background: rgba(13, 180, 158, 0.08);
}

.lang-indicator-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--accent-purple);
}

.lang-indicator-dot.dot-json {
  background-color: var(--accent-primary);
  box-shadow: 0 0 6px var(--accent-primary);
}

.lang-btn-name {
  font-weight: 600;
  color: var(--text-main);
}

.lang-dropdown-menu {
  width: 320px;
  padding: 8px;
}

.dropdown-section-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-subtle);
  padding: 4px 8px 6px;
}

.lang-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.lang-item-title {
  font-weight: 600;
  font-size: 13px;
}

.lang-item-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: var(--radius-full);
  background: rgba(13, 180, 158, 0.2);
  color: var(--accent-primary);
  font-weight: 600;
}

.lang-item-desc {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}

.dropdown-divider {
  height: 1px;
  background: var(--border-subtle);
  margin: 6px 0;
}

.lang-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
}

.lang-grid-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.12s ease;
}

.lang-grid-item:hover {
  background: var(--bg-surface-hover);
}

.lang-grid-item.active {
  background: rgba(13, 180, 158, 0.15);
  color: var(--accent-primary);
  font-weight: 600;
}

.grid-item-name {
  font-size: 12px;
}

.grid-item-ext {
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--text-subtle);
}

.dropdown-wrapper {
  position: relative;
}

.dropdown-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: 6px;
  z-index: 100;
  animation: fadeIn 0.15s ease;
}

.dropdown-item {
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 0.12s ease;
}

.dropdown-item:hover {
  background-color: var(--bg-surface-hover);
}

.dropdown-item.active {
  background: rgba(13, 180, 158, 0.15);
}

.sample-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}

.sample-desc {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}

.stats-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--text-muted);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #10b981;
  box-shadow: 0 0 6px #10b981;
}

.stats-invalid .status-dot {
  background-color: #f43f5e;
  box-shadow: 0 0 6px #f43f5e;
}

.stats-invalid {
  border-color: rgba(244, 63, 94, 0.4);
  color: #f43f5e;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.divider {
  width: 1px;
  height: 20px;
  background-color: var(--border-subtle);
}

@media (max-width: 900px) {
  .hide-mobile {
    display: none;
  }
  .stats-pill {
    display: none;
  }
}
</style>
