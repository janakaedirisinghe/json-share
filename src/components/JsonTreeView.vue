<template>
  <div class="tree-container">
    <!-- Tree Header Toolbar -->
    <div class="tree-header">
      <!-- Search Filter Input -->
      <div class="search-box">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Filter keys or values (Cmd+F)..."
          class="search-input"
        />
        <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">✕</button>
      </div>

      <!-- Controls -->
      <div class="tree-controls">
        <button class="btn btn-ghost btn-sm" @click="triggerExpandAll" title="Expand All Nodes">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="7 13 12 18 17 13"></polyline>
            <polyline points="7 6 12 11 17 6"></polyline>
          </svg>
          <span>Expand All</span>
        </button>

        <button class="btn btn-ghost btn-sm" @click="triggerCollapseAll" title="Collapse All Nodes">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="17 11 12 6 7 11"></polyline>
            <polyline points="17 18 12 13 7 18"></polyline>
          </svg>
          <span>Collapse All</span>
        </button>

        <button class="btn btn-ghost btn-sm" @click="downloadJson" title="Download formatted JSON file">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Export</span>
        </button>
      </div>
    </div>

    <!-- Tree Content Body -->
    <div class="tree-body">
      <div v-if="parsedData !== null && parsedData !== undefined" class="tree-content">
        <JsonTreeNode
          :data="parsedData"
          :node-key="null"
          :path="[]"
          :depth="0"
          :expand-all="expandAllState"
          :collapse-all="collapseAllState"
          :search-query="searchQuery"
          @toast="(msg, t) => $emit('toast', msg, t)"
        />
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        </div>
        <h3>No Valid JSON Parsed</h3>
        <p>Paste or type JSON in the left panel, or load one of the built-in samples.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import JsonTreeNode from './JsonTreeNode.vue'

const props = defineProps({
  parsedData: {
    type: [Object, Array, String, Number, Boolean, null],
    default: null
  },
  rawJson: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['toast'])

const searchQuery = ref('')
const expandAllState = ref(false)
const collapseAllState = ref(false)

function triggerExpandAll() {
  expandAllState.value = true
  collapseAllState.value = false
  setTimeout(() => { expandAllState.value = false }, 50)
}

function triggerCollapseAll() {
  collapseAllState.value = true
  expandAllState.value = false
  setTimeout(() => { collapseAllState.value = false }, 50)
}

function downloadJson() {
  if (!props.rawJson) return
  const blob = new Blob([props.rawJson], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `jsonshare-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  emit('toast', 'JSON file downloaded', 'success')
}
</script>

<style scoped>
.tree-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  overflow: hidden;
}

.tree-header {
  height: var(--toolbar-height);
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface-elevated);
  gap: 12px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 4px 10px;
  flex: 1;
  max-width: 300px;
  color: var(--text-muted);
}

.search-input {
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-main);
  font-size: 12px;
  font-family: var(--font-sans);
  width: 100%;
}

.clear-search-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 11px;
}

.tree-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tree-body {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  text-align: center;
  gap: 8px;
}

.empty-icon {
  color: var(--text-subtle);
  margin-bottom: 4px;
}

.empty-state h3 {
  font-size: 15px;
  color: var(--text-main);
}

.empty-state p {
  font-size: 13px;
  max-width: 320px;
}
</style>
