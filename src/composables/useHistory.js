import { ref } from 'vue'

const HISTORY_KEY = 'jsonshare_history'
const MAX_HISTORY = 20

export function useHistory() {
  const historyList = ref([])

  function loadHistory() {
    try {
      const saved = localStorage.getItem(HISTORY_KEY)
      if (saved) {
        historyList.value = JSON.parse(saved)
      }
    } catch (e) {
      console.warn('Failed to load history', e)
    }
  }

  function saveToHistory(rawJson, customTitle = '') {
    if (!rawJson || rawJson.trim() === '') return

    loadHistory()

    // Create preview
    let preview = rawJson.trim().slice(0, 120)
    let autoTitle = customTitle || 'Untitled JSON'
    
    try {
      const parsed = JSON.parse(rawJson)
      if (!customTitle) {
        if (Array.isArray(parsed)) {
          autoTitle = `Array (${parsed.length} items)`
        } else if (typeof parsed === 'object') {
          const keys = Object.keys(parsed)
          autoTitle = keys.length ? `Object { ${keys.slice(0, 3).join(', ')}... }` : 'Empty Object'
        }
      }
    } catch {
      // not valid json yet, still allow saving
    }

    const item = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      title: autoTitle,
      timestamp: new Date().toISOString(),
      size: new Blob([rawJson]).size,
      raw: rawJson,
      preview
    }

    // Filter duplicates with exact content
    const filtered = historyList.value.filter(h => h.raw !== rawJson)
    historyList.value = [item, ...filtered].slice(0, MAX_HISTORY)

    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(historyList.value))
    } catch (e) {
      console.warn('Failed to persist history', e)
    }
  }

  function deleteHistoryItem(id) {
    historyList.value = historyList.value.filter(item => item.id !== id)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(historyList.value))
  }

  function clearAllHistory() {
    historyList.value = []
    localStorage.removeItem(HISTORY_KEY)
  }

  loadHistory()

  return {
    historyList,
    saveToHistory,
    deleteHistoryItem,
    clearAllHistory,
    loadHistory
  }
}
