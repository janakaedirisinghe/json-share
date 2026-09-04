<template>
  <div class="diff-container">
    <!-- Diff Header Toolbar -->
    <div class="diff-header">
      <div class="diff-title-group">
        <span class="panel-label">JSON Diff Comparison</span>
        <span class="diff-stat-badge">
          <span class="diff-stat-add">+{{ diffStats.added }}</span>
          <span class="diff-stat-del">-{{ diffStats.removed }}</span>
        </span>
      </div>

      <div class="diff-controls">
        <button class="btn btn-ghost btn-sm" @click="formatBoth" title="Format Both JSONs">
          <span>Format Both</span>
        </button>
        <button class="btn btn-ghost btn-sm" @click="swapDiff" title="Swap Left and Right">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="17 1 21 5 17 9"></polyline>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
            <polyline points="7 23 3 19 7 15"></polyline>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
          </svg>
          <span>Swap</span>
        </button>
      </div>
    </div>

    <!-- Diff Split View -->
    <div class="diff-body">
      <!-- Left Panel: Original -->
      <div class="diff-panel">
        <div class="diff-panel-title">Original (Base)</div>
        <textarea
          v-model="leftText"
          class="diff-textarea"
          placeholder="// Paste original JSON..."
          spellcheck="false"
        ></textarea>
      </div>

      <!-- Right Panel: Modified -->
      <div class="diff-panel">
        <div class="diff-panel-title">Modified (Compare)</div>
        <textarea
          v-model="rightText"
          class="diff-textarea"
          placeholder="// Paste modified JSON to compare..."
          spellcheck="false"
        ></textarea>
      </div>
    </div>

    <!-- Computed Diff View -->
    <div class="diff-result-section" v-if="diffLines.length">
      <div class="diff-result-header">Unified Line Diff</div>
      <div class="diff-lines">
        <div
          v-for="(line, idx) in diffLines"
          :key="idx"
          class="diff-line"
          :class="`diff-type-${line.type}`"
        >
          <span class="diff-prefix">{{ line.prefix }}</span>
          <span class="diff-text">{{ line.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  initialLeft: {
    type: String,
    default: ''
  }
})

const leftText = ref(props.initialLeft || '')
const rightText = ref('')

watch(() => props.initialLeft, (val) => {
  if (val && !leftText.value) {
    leftText.value = val
  }
})

function formatBoth() {
  try {
    if (leftText.value.trim()) {
      leftText.value = JSON.stringify(JSON.parse(leftText.value), null, 2)
    }
  } catch {}

  try {
    if (rightText.value.trim()) {
      rightText.value = JSON.stringify(JSON.parse(rightText.value), null, 2)
    }
  } catch {}
}

function swapDiff() {
  const temp = leftText.value
  leftText.value = rightText.value
  rightText.value = temp
}

const diffLines = computed(() => {
  const leftLines = leftText.value.split('\n')
  const rightLines = rightText.value.split('\n')

  const lines = []
  const max = Math.max(leftLines.length, rightLines.length)

  for (let i = 0; i < max; i++) {
    const l = leftLines[i]
    const r = rightLines[i]

    if (l === r) {
      if (l !== undefined) {
        lines.push({ type: 'same', prefix: ' ', text: l })
      }
    } else {
      if (l !== undefined) {
        lines.push({ type: 'del', prefix: '-', text: l })
      }
      if (r !== undefined) {
        lines.push({ type: 'add', prefix: '+', text: r })
      }
    }
  }
  return lines
})

const diffStats = computed(() => {
  let added = 0
  let removed = 0
  diffLines.value.forEach(l => {
    if (l.type === 'add') added++
    if (l.type === 'del') removed++
  })
  return { added, removed }
})
</script>

<style scoped>
.diff-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  overflow: hidden;
}

.diff-header {
  height: var(--toolbar-height);
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface-elevated);
}

.diff-title-group {
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

.diff-stat-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-family: var(--font-mono);
  font-weight: 600;
}

.diff-stat-add {
  color: var(--accent-emerald);
}

.diff-stat-del {
  color: var(--accent-rose);
}

.diff-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.diff-body {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--border-subtle);
  min-height: 220px;
  overflow: hidden;
}

.diff-panel {
  background: var(--bg-surface);
  display: flex;
  flex-direction: column;
}

.diff-panel-title {
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface-elevated);
}

.diff-textarea {
  flex: 1;
  padding: 10px 12px;
  background: transparent;
  color: var(--text-main);
  border: none;
  outline: none;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 18px;
  resize: none;
  white-space: pre;
}

.diff-result-section {
  flex: 1;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 45%;
}

.diff-result-header {
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--bg-surface-elevated);
  border-bottom: 1px solid var(--border-subtle);
}

.diff-lines {
  flex: 1;
  overflow: auto;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 20px;
  padding: 6px 0;
}

.diff-line {
  display: flex;
  padding: 0 12px;
  white-space: pre;
}

.diff-prefix {
  width: 20px;
  user-select: none;
  font-weight: bold;
}

.diff-type-same {
  color: var(--text-muted);
}

.diff-type-add {
  background: rgba(52, 211, 153, 0.15);
  color: var(--accent-emerald);
}

.diff-type-del {
  background: rgba(244, 63, 94, 0.15);
  color: var(--accent-rose);
}
</style>
