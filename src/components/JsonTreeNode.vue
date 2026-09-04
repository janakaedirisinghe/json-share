<template>
  <div class="tree-node" :class="{ 'node-matched': isDirectMatch }">
    <div class="node-line" @click="handleLineClick">
      <!-- Expand/Collapse Chevron -->
      <button
        v-if="isExpandable"
        class="toggle-btn"
        @click.stop="toggleExpand"
        :aria-expanded="isExpanded"
      >
        <svg
          viewBox="0 0 24 24"
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          :class="{ 'rotate-90': isExpanded }"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
      <span v-else class="toggle-spacer"></span>

      <!-- Key Name or Array Index -->
      <span v-if="nodeKey !== null && nodeKey !== undefined" class="node-key" :class="{ 'array-index': isIndex }">
        {{ isIndex ? `[${nodeKey}]` : `"${nodeKey}"` }}:
      </span>

      <!-- Value / Preview -->
      <template v-if="isObject">
        <span class="bracket-token">{</span>
        <span v-if="!isExpanded" class="node-collapsed-preview">
          <span class="badge badge-obj">{{ objectKeyCount }} keys</span>
          <span class="bracket-token">}</span>
        </span>
        <span v-else class="node-item-count">{{ objectKeyCount }} keys</span>
      </template>

      <template v-else-if="isArray">
        <span class="bracket-token">[</span>
        <span v-if="!isExpanded" class="node-collapsed-preview">
          <span class="badge badge-arr">{{ arrayItemCount }} items</span>
          <span class="bracket-token">]</span>
        </span>
        <span v-else class="node-item-count">{{ arrayItemCount }} items</span>
      </template>

      <template v-else>
        <!-- Primitive Values -->
        <span :class="valueClass">{{ formattedValue }}</span>
        <span class="type-pill" :class="`badge-${typeBadgeClass}`">{{ valueType }}</span>
      </template>

      <!-- Hover Action Buttons (Copy Path, Copy Value) -->
      <div class="node-actions" @click.stop>
        <button
          class="action-btn"
          @click="copyJsonPath"
          title="Copy JSONPath (e.g. $.data.id)"
        >
          <span>Path</span>
        </button>
        <button
          class="action-btn"
          @click="copyValue"
          title="Copy Value"
        >
          <span>Copy</span>
        </button>
      </div>
    </div>

    <!-- Nested Children -->
    <div v-if="isExpandable && isExpanded" class="node-children">
      <template v-if="isObject">
        <JsonTreeNode
          v-for="k in Object.keys(data)"
          :key="k"
          :node-key="k"
          :data="data[k]"
          :path="[...path, k]"
          :depth="depth + 1"
          :expand-all="expandAll"
          :collapse-all="collapseAll"
          :search-query="searchQuery"
          @toast="(msg, t) => $emit('toast', msg, t)"
        />
        <div class="node-closing-bracket">
          <span class="bracket-token">}</span>
        </div>
      </template>

      <template v-else-if="isArray">
        <JsonTreeNode
          v-for="(item, idx) in data"
          :key="idx"
          :node-key="idx"
          :is-index="true"
          :data="item"
          :path="[...path, idx]"
          :depth="depth + 1"
          :expand-all="expandAll"
          :collapse-all="collapseAll"
          :search-query="searchQuery"
          @toast="(msg, t) => $emit('toast', msg, t)"
        />
        <div class="node-closing-bracket">
          <span class="bracket-token">]</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { buildPath } from '../utils/jsonUtils'

const props = defineProps({
  data: {
    type: [Object, Array, String, Number, Boolean, null],
    default: null
  },
  nodeKey: {
    type: [String, Number],
    default: null
  },
  isIndex: {
    type: Boolean,
    default: false
  },
  path: {
    type: Array,
    default: () => []
  },
  depth: {
    type: Number,
    default: 0
  },
  expandAll: {
    type: Boolean,
    default: false
  },
  collapseAll: {
    type: Boolean,
    default: false
  },
  searchQuery: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['toast'])

const isExpanded = ref(props.depth < 2)

const isObject = computed(() => {
  return props.data !== null && typeof props.data === 'object' && !Array.isArray(props.data)
})

const isArray = computed(() => {
  return Array.isArray(props.data)
})

const isExpandable = computed(() => isObject.value || isArray.value)

const objectKeyCount = computed(() => {
  if (!isObject.value) return 0
  return Object.keys(props.data).length
})

const arrayItemCount = computed(() => {
  if (!isArray.value) return 0
  return props.data.length
})

const valueType = computed(() => {
  if (props.data === null) return 'null'
  if (props.data === undefined) return 'undefined'
  return typeof props.data
})

const typeBadgeClass = computed(() => {
  if (props.data === null) return 'null'
  if (typeof props.data === 'string') return 'str'
  if (typeof props.data === 'number') return 'num'
  if (typeof props.data === 'boolean') return 'bool'
  return 'obj'
})

const formattedValue = computed(() => {
  if (props.data === null) return 'null'
  if (props.data === undefined) return 'undefined'
  if (typeof props.data === 'string') return `"${props.data}"`
  return String(props.data)
})

const valueClass = computed(() => {
  if (props.data === null) return 'val-null'
  if (typeof props.data === 'string') return 'val-string'
  if (typeof props.data === 'number') return 'val-number'
  if (typeof props.data === 'boolean') return 'val-boolean'
  return ''
})

const isDirectMatch = computed(() => {
  if (!props.searchQuery || props.searchQuery.trim() === '') return false
  const q = props.searchQuery.toLowerCase()
  const keyStr = String(props.nodeKey || '').toLowerCase()
  const valStr = String(props.data || '').toLowerCase()
  return keyStr.includes(q) || valStr.includes(q)
})

// React to global expand / collapse triggers
watch(() => props.expandAll, (val) => {
  if (val) isExpanded.value = true
})

watch(() => props.collapseAll, (val) => {
  if (val) isExpanded.value = false
})

function toggleExpand() {
  if (isExpandable.value) {
    isExpanded.value = !isExpanded.value
  }
}

function handleLineClick() {
  if (isExpandable.value) {
    isExpanded.value = !isExpanded.value
  }
}

async function copyJsonPath() {
  const jsonPath = buildPath(props.path, 'jsonpath')
  try {
    await navigator.clipboard.writeText(jsonPath)
    emit('toast', `Copied path: ${jsonPath}`, 'success')
  } catch {
    emit('toast', 'Failed to copy path', 'error')
  }
}

async function copyValue() {
  let text = ''
  if (typeof props.data === 'object' && props.data !== null) {
    text = JSON.stringify(props.data, null, 2)
  } else {
    text = String(props.data)
  }

  try {
    await navigator.clipboard.writeText(text)
    emit('toast', 'Copied value to clipboard', 'success')
  } catch {
    emit('toast', 'Failed to copy', 'error')
  }
}
</script>

<style scoped>
.tree-node {
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 24px;
}

.node-line {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 1px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  position: relative;
  transition: background-color 0.1s ease;
}

.node-line:hover {
  background-color: var(--bg-surface-hover);
}

.node-line:hover .node-actions {
  opacity: 1;
  pointer-events: auto;
}

.node-matched {
  background: rgba(251, 191, 36, 0.15);
  border-radius: var(--radius-sm);
}

.toggle-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  transition: transform 0.15s ease;
}

.toggle-btn svg {
  transition: transform 0.15s ease;
}

.rotate-90 {
  transform: rotate(90deg);
}

.toggle-spacer {
  width: 16px;
  display: inline-block;
}

.node-key {
  color: var(--syn-key);
  font-weight: 500;
}

.array-index {
  color: var(--syn-bracket);
  font-weight: 400;
}

.bracket-token {
  color: var(--syn-bracket);
  font-weight: 600;
}

.node-item-count {
  font-size: 11px;
  color: var(--text-subtle);
}

.node-collapsed-preview {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.val-string {
  color: var(--syn-string);
  word-break: break-all;
}

.val-number {
  color: var(--syn-number);
}

.val-boolean {
  color: var(--syn-boolean);
  font-weight: 600;
}

.val-null {
  color: var(--syn-null);
  font-weight: 600;
}

.type-pill {
  font-size: 10px;
  padding: 1px 5px;
  margin-left: 4px;
}

.node-actions {
  opacity: 0;
  pointer-events: none;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: opacity 0.15s ease;
}

.action-btn {
  padding: 2px 6px;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  color: var(--text-muted);
  font-size: 10px;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all 0.12s ease;
}

.action-btn:hover {
  background: var(--bg-surface-hover);
  color: var(--text-main);
  border-color: var(--text-muted);
}

.node-children {
  padding-left: 20px;
  border-left: 1px dashed rgba(255, 255, 255, 0.1);
  margin-left: 8px;
}

[data-theme="light"] .node-children {
  border-left-color: rgba(0, 0, 0, 0.1);
}

.node-closing-bracket {
  padding-left: 22px;
}
</style>
