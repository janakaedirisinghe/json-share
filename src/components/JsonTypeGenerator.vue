<template>
  <div class="types-container">
    <!-- Header with Language Selector & Root Type Name -->
    <div class="types-header">
      <div class="lang-tabs">
        <button
          v-for="lang in supportedLanguages"
          :key="lang.id"
          class="lang-tab-btn"
          :class="{ active: selectedLang === lang.id }"
          @click="selectedLang = lang.id"
        >
          <span class="lang-icon">{{ lang.icon }}</span>
          <span>{{ lang.name }}</span>
        </button>
      </div>

      <div class="types-controls">
        <div class="root-input-group">
          <label>Type Name:</label>
          <input
            type="text"
            v-model="rootName"
            placeholder="RootObject"
            class="input-text root-input"
          />
        </div>

        <button class="btn btn-ghost btn-sm" @click="copyCode" :disabled="!generatedCode">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>Copy Code</span>
        </button>
      </div>
    </div>

    <!-- Generated Code Preview -->
    <div class="types-body">
      <div v-if="parsedData !== null && parsedData !== undefined" class="code-view">
        <pre class="generated-pre"><code>{{ generatedCode }}</code></pre>
      </div>
      <div v-else class="empty-types-state">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
        <h3>No Valid JSON Parsed</h3>
        <p>Input valid JSON to automatically generate schemas and strong types.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  generateTypeScript,
  generatePython,
  generateGo,
  generateJsonSchema
} from '../utils/jsonTypeConverters'

const props = defineProps({
  parsedData: {
    type: [Object, Array, String, Number, Boolean, null],
    default: null
  }
})

const emit = defineEmits(['toast'])

const selectedLang = ref('typescript')
const rootName = ref('DataModel')

const supportedLanguages = [
  { id: 'typescript', name: 'TypeScript', icon: 'TS' },
  { id: 'python', name: 'Python (Pydantic)', icon: 'PY' },
  { id: 'go', name: 'Go Struct', icon: 'GO' },
  { id: 'schema', name: 'JSON Schema', icon: '{ }' }
]

const generatedCode = computed(() => {
  if (props.parsedData === null || props.parsedData === undefined) return ''

  const name = rootName.value.trim() || 'DataModel'

  if (selectedLang.value === 'typescript') {
    return generateTypeScript(props.parsedData, name)
  }
  if (selectedLang.value === 'python') {
    return generatePython(props.parsedData, name)
  }
  if (selectedLang.value === 'go') {
    return generateGo(props.parsedData, name)
  }
  if (selectedLang.value === 'schema') {
    return generateJsonSchema(props.parsedData)
  }
  return ''
})

async function copyCode() {
  if (!generatedCode.value) return
  try {
    await navigator.clipboard.writeText(generatedCode.value)
    emit('toast', `Copied ${selectedLang.value} code to clipboard`, 'success')
  } catch {
    emit('toast', 'Failed to copy', 'error')
  }
}
</script>

<style scoped>
.types-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  overflow: hidden;
}

.types-header {
  height: var(--toolbar-height);
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface-elevated);
  gap: 12px;
}

.lang-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
}

.lang-tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
}

.lang-tab-btn:hover {
  background: var(--bg-surface-hover);
  color: var(--text-main);
}

.lang-tab-btn.active {
  background: var(--bg-surface);
  color: var(--accent-primary);
  border: 1px solid var(--border-subtle);
}

.lang-icon {
  font-size: 10px;
  font-weight: 700;
  font-family: var(--font-mono);
  padding: 1px 4px;
  border-radius: 3px;
  background: var(--bg-surface-hover);
}

.types-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.root-input-group {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

.root-input {
  width: 120px;
  padding: 3px 8px;
  font-size: 12px;
}

.types-body {
  flex: 1;
  overflow: auto;
  padding: 16px;
  background: var(--bg-app);
}

.code-view {
  min-height: 100%;
}

.generated-pre {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-main);
  white-space: pre-wrap;
  word-break: break-word;
}

.empty-types-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  text-align: center;
  gap: 8px;
}

.empty-types-state h3 {
  font-size: 15px;
  color: var(--text-main);
}

.empty-types-state p {
  font-size: 13px;
  max-width: 320px;
}
</style>
