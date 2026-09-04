import { ref, computed, watch } from 'vue'
import { smartRepairJson, calcJsonStats } from '../utils/jsonUtils'
import { SAMPLES } from '../utils/samples'

const rawJson = ref('')
const parsedJson = ref(null)
const isValid = ref(true)
const parseError = ref(null)
const activeTab = ref('tree') // 'editor' | 'tree' | 'table' | 'types' | 'diff'
const formatSpaces = ref(2)
const searchQuery = ref('')
const isRepaired = ref(false)

export function useJsonState() {
  const stats = computed(() => {
    return calcJsonStats(parsedJson.value, rawJson.value)
  })

  const hasContent = computed(() => {
    return rawJson.value.trim().length > 0
  })

  function parseCurrentJson(text) {
    if (!text || text.trim() === '') {
      parsedJson.value = null
      isValid.value = true
      parseError.value = null
      return
    }

    try {
      const parsed = JSON.parse(text)
      parsedJson.value = parsed
      isValid.value = true
      parseError.value = null
    } catch (err) {
      isValid.value = false
      parseError.value = {
        message: err.message,
        line: extractErrorLine(err.message, text)
      }
    }
  }

  function extractErrorLine(msg, text) {
    // Attempt to extract position from "at position 123" or line info
    const posMatch = msg.match(/position (\d+)/i)
    if (posMatch && posMatch[1]) {
      const pos = parseInt(posMatch[1], 10)
      const lines = text.substring(0, pos).split('\n')
      return {
        lineNumber: lines.length,
        colNumber: lines[lines.length - 1].length + 1
      }
    }
    return null
  }

  function setRawJson(text, triggerParse = true) {
    rawJson.value = text
    if (triggerParse) {
      parseCurrentJson(text)
    }
  }

  function formatJson(spaces = formatSpaces.value) {
    if (!rawJson.value.trim()) return

    // If currently invalid, attempt smart repair first
    if (!isValid.value) {
      const repaired = smartRepairJson(rawJson.value)
      try {
        const parsed = JSON.parse(repaired)
        rawJson.value = JSON.stringify(parsed, null, spaces)
        parseCurrentJson(rawJson.value)
        isRepaired.value = true
        return true
      } catch {
        // still malformed
        return false
      }
    }

    if (parsedJson.value !== null && parsedJson.value !== undefined) {
      rawJson.value = JSON.stringify(parsedJson.value, null, spaces)
      parseCurrentJson(rawJson.value)
      return true
    }
    return false
  }

  function minifyJson() {
    if (!rawJson.value.trim()) return
    if (!isValid.value) {
      const repaired = smartRepairJson(rawJson.value)
      try {
        const parsed = JSON.parse(repaired)
        rawJson.value = JSON.stringify(parsed)
        parseCurrentJson(rawJson.value)
        return true
      } catch {
        return false
      }
    }
    if (parsedJson.value !== null) {
      rawJson.value = JSON.stringify(parsedJson.value)
      parseCurrentJson(rawJson.value)
      return true
    }
    return false
  }

  function repairJson() {
    if (!rawJson.value.trim()) return false
    const repaired = smartRepairJson(rawJson.value)
    try {
      const parsed = JSON.parse(repaired)
      rawJson.value = JSON.stringify(parsed, null, formatSpaces.value)
      parseCurrentJson(rawJson.value)
      isRepaired.value = true
      return true
    } catch (e) {
      return false
    }
  }

  function loadSample(sampleId) {
    const found = SAMPLES.find(s => s.id === sampleId) || SAMPLES[0]
    if (found) {
      rawJson.value = JSON.stringify(found.data, null, formatSpaces.value)
      parseCurrentJson(rawJson.value)
    }
  }

  function clearAll() {
    rawJson.value = ''
    parsedJson.value = null
    isValid.value = true
    parseError.value = null
    searchQuery.value = ''
    isRepaired.value = false
  }

  // Watch rawJson modifications from external sources
  watch(rawJson, (newVal) => {
    parseCurrentJson(newVal)
  })

  return {
    rawJson,
    parsedJson,
    isValid,
    parseError,
    stats,
    hasContent,
    activeTab,
    formatSpaces,
    searchQuery,
    isRepaired,
    setRawJson,
    formatJson,
    minifyJson,
    repairJson,
    loadSample,
    clearAll
  }
}
