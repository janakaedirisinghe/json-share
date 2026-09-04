<template>
  <div class="app-root">
    <!-- Top Header -->
    <HeaderNav
      :has-content="hasContent"
      :is-valid="isValid"
      :stats="stats"
      @format="formatJson"
      @minify="minifyJson"
      @repair="handleRepair"
      @clear="clearAll"
      @load-sample="loadSample"
      @open-share="openShareModal"
      @open-history="showHistoryDrawer = true"
      @reset-view="resetToDefault"
    />

    <!-- Shared Link Banner -->
    <div v-if="isSharedSession" class="shared-banner">
      <div class="banner-content">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
        <span>Viewing a <strong>Shared JSON Document</strong> via zero-backend link</span>
      </div>
      <div class="banner-actions">
        <button class="btn btn-sm btn-banner" @click="saveCurrentToHistory" title="Save this document to your local history">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Save to History</span>
        </button>
        <button class="btn btn-sm btn-banner" @click="clearShareUrl" title="Create a new document">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>New Document</span>
        </button>
      </div>
    </div>

    <!-- Password Unlock Dialog for Encrypted Shares -->
    <div v-if="isEncryptedSession" class="modal-overlay">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-header-title">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <h3>Password-Protected JSON</h3>
          </div>
        </div>
        <div class="modal-body">
          <p class="unlock-desc">This JSON payload was encrypted with AES-GCM 256-bit. Please enter the password to decrypt it:</p>
          <div class="unlock-input-group">
            <input
              type="password"
              v-model="unlockPassword"
              placeholder="Enter password..."
              class="input-text"
              @keydown.enter="attemptUnlock"
              autofocus
            />
            <button class="btn btn-primary" @click="attemptUnlock">
              Decrypt & View
            </button>
          </div>
          <p v-if="unlockError" class="unlock-error">{{ unlockError }}</p>
        </div>
      </div>
    </div>

    <!-- Mode Selector Navigation Bar -->
    <div class="mode-bar">
      <div class="tab-list">
        <button
          class="mode-tab"
          :class="{ active: activeTab === 'tree' }"
          @click="activeTab = 'tree'"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="6" y1="3" x2="6" y2="15"></line>
            <circle cx="18" cy="6" r="3"></circle>
            <circle cx="6" cy="18" r="3"></circle>
            <path d="M18 9a9 9 0 0 1-9 9"></path>
          </svg>
          <span>Tree Viewer</span>
        </button>

        <button
          class="mode-tab"
          :class="{ active: activeTab === 'table' }"
          @click="activeTab = 'table'"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="3" y1="15" x2="21" y2="15"></line>
            <line x1="9" y1="3" x2="9" y2="21"></line>
            <line x1="15" y1="3" x2="15" y2="21"></line>
          </svg>
          <span>Table View</span>
        </button>

        <button
          class="mode-tab"
          :class="{ active: activeTab === 'types' }"
          @click="activeTab = 'types'"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <span>Type Generator</span>
        </button>

        <button
          class="mode-tab"
          :class="{ active: activeTab === 'diff' }"
          @click="activeTab = 'diff'"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <span>JSON Diff</span>
        </button>
      </div>

      <div class="mode-bar-right">
        <!-- Layout Toggle (Split vs Full) -->
        <button
          class="btn btn-ghost btn-sm"
          @click="toggleSplitView"
          :title="isSplitView ? 'Hide Source Panel' : 'Show Source & Viewer Side-by-Side'"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="12" y1="3" x2="12" y2="21"></line>
          </svg>
          <span>{{ isSplitView ? 'Split View' : 'Single View' }}</span>
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <main class="workspace-main" :class="{ 'split-layout': isSplitView, 'single-layout': !isSplitView }">
      <!-- Left Panel: Raw Source Editor -->
      <section v-show="isSplitView || activeTab === 'editor'" class="workspace-panel panel-left">
        <JsonInputEditor
          :model-value="rawJson"
          :is-valid="isValid"
          :parse-error="parseError"
          @update:model-value="onSourceChange"
          @repair="handleRepair"
          @toast="triggerToast"
        />
      </section>

      <!-- Right Panel: Active Viewer Mode -->
      <section class="workspace-panel panel-right">
        <!-- Tree View -->
        <JsonTreeView
          v-if="activeTab === 'tree'"
          :parsed-data="parsedJson"
          :raw-json="rawJson"
          @toast="triggerToast"
        />

        <!-- Table View -->
        <JsonTableView
          v-else-if="activeTab === 'table'"
          :parsed-data="parsedJson"
          @toast="triggerToast"
        />

        <!-- Type Generator -->
        <JsonTypeGenerator
          v-else-if="activeTab === 'types'"
          :parsed-data="parsedJson"
          @toast="triggerToast"
        />

        <!-- Diff Viewer -->
        <JsonDiffViewer
          v-else-if="activeTab === 'diff'"
          :initial-left="rawJson"
          @toast="triggerToast"
        />
      </section>
    </main>

    <!-- Bottom Status & Footer Bar -->
    <footer class="app-footer">
      <div class="footer-left">
        <span class="footer-hint"><kbd>⌘S</kbd> / <kbd>Ctrl+S</kbd> to Share</span>
        <span class="footer-divider">•</span>
        <span class="footer-hint">100% Client-Side</span>
      </div>
      <div class="footer-right">
        <span>Made with ❤️ by</span>
        <a href="https://janakaedirisinghe.com/" target="_blank" rel="noopener noreferrer" class="footer-author-link">
          <img src="https://janakaedirisinghe.com/u/github_avatar.png" alt="Janaka Edirisinghe" class="author-avatar" />
          <span>Janaka Edirisinghe</span>
        </a>
      </div>
    </footer>

    <!-- Share Modal -->
    <ShareModal
      v-if="showShareModal"
      :raw-json="rawJson"
      @close="showShareModal = false"
      @toast="triggerToast"
    />

    <!-- History Drawer -->
    <HistoryDrawer
      v-if="showHistoryDrawer"
      @close="showHistoryDrawer = false"
      @load-json="onHistoryLoad"
      @toast="triggerToast"
    />

    <!-- Toast Notifications -->
    <ToastNotification ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import HeaderNav from './components/HeaderNav.vue'
import JsonInputEditor from './components/JsonInputEditor.vue'
import JsonTreeView from './components/JsonTreeView.vue'
import JsonTableView from './components/JsonTableView.vue'
import JsonTypeGenerator from './components/JsonTypeGenerator.vue'
import JsonDiffViewer from './components/JsonDiffViewer.vue'
import ShareModal from './components/ShareModal.vue'
import HistoryDrawer from './components/HistoryDrawer.vue'
import ToastNotification from './components/ToastNotification.vue'

import { useJsonState } from './composables/useJsonState'
import { useUrlShare } from './composables/useUrlShare'
import { useHistory } from './composables/useHistory'

const {
  rawJson,
  parsedJson,
  isValid,
  parseError,
  stats,
  hasContent,
  activeTab,
  formatJson,
  minifyJson,
  repairJson,
  loadSample,
  clearAll,
  setRawJson
} = useJsonState()

const {
  isSharedSession,
  isEncryptedSession,
  isLoadingShortLink,
  checkUrlForSharedData,
  unlockEncryptedPayload,
  clearShareUrl
} = useUrlShare()

const { saveToHistory } = useHistory()

const showShareModal = ref(false)
const showHistoryDrawer = ref(false)
const isSplitView = ref(true)
const toastRef = ref(null)

const unlockPassword = ref('')
const unlockError = ref('')

function triggerToast(msg, type = 'success') {
  if (toastRef.value?.showToast) {
    toastRef.value.showToast(msg, type)
  }
}

function onSourceChange(val) {
  setRawJson(val)
}

function handleRepair() {
  const success = repairJson()
  if (success) {
    triggerToast('JSON repaired successfully', 'success')
  } else {
    triggerToast('Could not automatically repair JSON', 'error')
  }
}

function openShareModal() {
  if (!hasContent.value) {
    triggerToast('Please input JSON before sharing', 'warning')
    return
  }
  saveToHistory(rawJson.value)
  showShareModal.value = true
}

function saveCurrentToHistory() {
  if (hasContent.value) {
    saveToHistory(rawJson.value)
    triggerToast('Saved to local history', 'success')
  }
}

function onHistoryLoad(json) {
  setRawJson(json)
}

function resetToDefault() {
  clearShareUrl()
  loadSample('user_profile')
}

function toggleSplitView() {
  isSplitView.value = !isSplitView.value
}

async function attemptUnlock() {
  if (!unlockPassword.value) {
    unlockError.value = 'Please enter password'
    return
  }
  try {
    const decrypted = await unlockEncryptedPayload(unlockPassword.value)
    setRawJson(decrypted)
    unlockError.value = ''
    triggerToast('Decrypted successfully!', 'success')
  } catch (err) {
    unlockError.value = 'Incorrect password or corrupted data'
  }
}

function handleGlobalKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault()
    openShareModal()
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleGlobalKeydown)

  // Check if opened with a shared payload or short link in URL hash
  const shared = await checkUrlForSharedData()
  if (shared && shared.data) {
    setRawJson(shared.data)
    triggerToast(shared.isShortLink ? 'Loaded from short link!' : 'Loaded shared JSON payload', 'success')
  } else if (!shared) {
    // Load default starter sample
    loadSample('user_profile')
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
.app-root {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-app);
}

.shared-banner {
  background: linear-gradient(90deg, #099280 0%, #0db49e 100%);
  color: #ffffff;
  padding: 8px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  box-shadow: var(--shadow-sm);
  z-index: 40;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-banner {
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.45);
  color: #ffffff !important;
  font-weight: 600;
  backdrop-filter: blur(4px);
  transition: all 0.15s ease;
}

.btn-banner:hover {
  background: rgba(255, 255, 255, 0.38);
  border-color: #ffffff;
  color: #ffffff !important;
  transform: translateY(-1px);
}

.mode-bar {
  height: var(--toolbar-height);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 30;
}

.tab-list {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mode-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mode-tab:hover {
  background: var(--bg-surface-hover);
  color: var(--text-main);
}

.mode-tab.active {
  background: var(--bg-surface-elevated);
  color: var(--accent-primary);
  border: 1px solid var(--border-subtle);
}

.mode-bar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.workspace-main {
  flex: 1;
  display: grid;
  overflow: hidden;
  background: var(--bg-app);
}

.split-layout {
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--border-subtle);
}

.single-layout {
  grid-template-columns: 1fr;
}

.workspace-panel {
  height: 100%;
  overflow: hidden;
  background: var(--bg-surface);
}

.unlock-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.unlock-input-group {
  display: flex;
  gap: 8px;
}

.unlock-error {
  color: var(--accent-rose);
  font-size: 12px;
  margin-top: 8px;
}

.app-footer {
  height: 28px;
  background: var(--bg-surface);
  border-top: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-size: 11px;
  color: var(--text-muted);
  user-select: none;
  z-index: 30;
}

.footer-left, .footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-divider {
  color: var(--text-subtle);
}

.footer-hint kbd {
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 3px;
  padding: 1px 4px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-main);
}

.author-avatar {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid rgba(13, 180, 158, 0.4);
  object-fit: cover;
  vertical-align: middle;
}

.footer-author-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--accent-primary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s ease, text-decoration 0.15s ease;
}

.footer-author-link:hover {
  text-decoration: underline;
  color: #14d6bd;
}

@media (max-width: 860px) {
  .split-layout {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
}
</style>
