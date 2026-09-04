<template>
  <div class="drawer-overlay" @click.self="$emit('close')">
    <div class="drawer-panel">
      <!-- Drawer Header -->
      <div class="drawer-header">
        <div class="drawer-title-group">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <h3>Saved JSON History</h3>
        </div>
        <button class="btn btn-ghost btn-icon-only" @click="$emit('close')">✕</button>
      </div>

      <!-- History Items List -->
      <div class="drawer-body">
        <div v-if="historyList.length" class="history-list">
          <div
            v-for="item in historyList"
            :key="item.id"
            class="history-card"
            @click="selectItem(item)"
          >
            <div class="card-top">
              <span class="card-title">{{ item.title }}</span>
              <button
                class="btn-delete"
                @click.stop="deleteHistoryItem(item.id)"
                title="Delete snippet"
              >
                ✕
              </button>
            </div>
            <div class="card-preview">{{ item.preview }}</div>
            <div class="card-footer">
              <span class="card-time">{{ formatTime(item.timestamp) }}</span>
              <span class="card-size">{{ formatBytes(item.size) }}</span>
            </div>
          </div>
        </div>

        <div v-else class="empty-history">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <h4>No Saved Snippets</h4>
          <p>JSON payloads you view or share will appear here in your browser's local storage.</p>
        </div>
      </div>

      <!-- Drawer Footer -->
      <div class="drawer-footer" v-if="historyList.length">
        <button class="btn btn-ghost btn-sm btn-clear-all" @click="clearAllHistory">
          Clear History
        </button>
        <span class="history-count">{{ historyList.length }} items stored</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHistory } from '../composables/useHistory'
import { formatBytes } from '../utils/jsonUtils'

const emit = defineEmits(['close', 'load-json', 'toast'])

const { historyList, deleteHistoryItem, clearAllHistory } = useHistory()

function selectItem(item) {
  emit('load-json', item.raw)
  emit('toast', `Loaded "${item.title}"`, 'success')
  emit('close')
}

function formatTime(isoStr) {
  try {
    const d = new Date(isoStr)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString()
  } catch {
    return 'Recently'
  }
}
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  animation: fadeIn 0.2s ease-out;
}

.drawer-panel {
  width: 360px;
  max-width: 90vw;
  height: 100%;
  background: var(--bg-surface);
  border-left: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  animation: slideLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideLeft {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.drawer-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-surface-elevated);
}

.drawer-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-main);
}

.drawer-title-group h3 {
  font-size: 15px;
  font-weight: 600;
}

.drawer-body {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-card {
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.history-card:hover {
  background: var(--bg-surface-hover);
  border-color: var(--accent-primary);
  transform: translateY(-1px);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-delete {
  background: transparent;
  border: none;
  color: var(--text-subtle);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
}

.btn-delete:hover {
  color: var(--accent-rose);
  background: rgba(244, 63, 94, 0.15);
}

.card-preview {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-subtle);
  margin-top: 4px;
}

.empty-history {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--text-muted);
  gap: 8px;
  padding: 20px;
}

.empty-history h4 {
  font-size: 15px;
  color: var(--text-main);
}

.empty-history p {
  font-size: 12px;
}

.drawer-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-surface-elevated);
}

.history-count {
  font-size: 11px;
  color: var(--text-subtle);
}

.btn-clear-all {
  color: var(--accent-rose);
}
</style>
