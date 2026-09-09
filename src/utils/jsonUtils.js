/**
 * Core JSON Utilities: formatting, smart repair, metrics, CSV export, and path helpers.
 */

/**
 * Smartly repairs commonly malformed JSON strings:
 * - Trailing commas in objects & arrays
 * - Python-style single quotes (`'key': 'value'`)
 * - Unquoted keys (`{ foo: 123 }`)
 * - Python boolean/None values (`True`, `False`, `None`)
 */
export function smartRepairJson(raw) {
  if (!raw || typeof raw !== 'string') return raw

  let cleaned = raw.trim()

  // Replace Python True, False, None
  cleaned = cleaned.replace(/:\s*True\b/g, ': true')
  cleaned = cleaned.replace(/:\s*False\b/g, ': false')
  cleaned = cleaned.replace(/:\s*None\b/g, ': null')

  // Convert single-quoted string values & keys to double quotes (safely avoiding escaped quotes)
  cleaned = cleaned.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"')

  // Quote unquoted keys: { key: "val" } -> { "key": "val" }
  cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z0-9_$-]+)\s*:/g, '$1"$2":')

  // Remove trailing commas: [1, 2,] -> [1, 2] and {"a": 1,} -> {"a": 1}
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1')

  return cleaned
}

/**
 * Calculate statistical insights of a JSON payload
 */
export function calcJsonStats(data, rawString = '') {
  let keyCount = 0
  let maxDepth = 0
  let arrayCount = 0
  let objectCount = 0
  let primitiveCount = 0

  function traverse(node, depth = 1) {
    if (depth > maxDepth) maxDepth = depth

    if (node === null || typeof node !== 'object') {
      primitiveCount++
      return
    }

    if (Array.isArray(node)) {
      arrayCount++
      node.forEach(item => traverse(item, depth + 1))
    } else {
      objectCount++
      const keys = Object.keys(node)
      keyCount += keys.length
      keys.forEach(k => traverse(node[k], depth + 1))
    }
  }

  try {
    if (data !== undefined && data !== null) {
      traverse(data)
    }
  } catch (e) {
    console.warn('Stats calculation failed:', e)
  }

  const rawBytes = new Blob([rawString || '']).size
  
  return {
    rawBytes,
    formattedSize: formatBytes(rawBytes),
    keyCount,
    maxDepth,
    arrayCount,
    objectCount,
    primitiveCount
  }
}

/**
 * Format bytes into human-readable string
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Build JSONPath or JS accessor string from key segments
 */
export function buildPath(segments, format = 'jsonpath') {
  if (!segments || segments.length === 0) return '$'
  
  if (format === 'jsonpath') {
    let res = '$'
    for (const seg of segments) {
      if (typeof seg === 'number') {
        res += `[${seg}]`
      } else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(seg)) {
        res += `.${seg}`
      } else {
        res += `["${seg}"]`
      }
    }
    return res
  }

  // JS dot notation
  let res = 'data'
  for (const seg of segments) {
    if (typeof seg === 'number') {
      res += `[${seg}]`
    } else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(seg)) {
      res += `.${seg}`
    } else {
      res += `["${seg}"]`
    }
  }
  return res
}

/**
 * Flattens array of objects into tabular structure
 */
export function extractTableData(data) {
  let list = []
  if (Array.isArray(data)) {
    list = data
  } else if (data && typeof data === 'object') {
    // If it has a primary array property (e.g. { data: [...], items: [...] })
    const arrayKey = Object.keys(data).find(k => Array.isArray(data[k]))
    if (arrayKey) {
      list = data[arrayKey]
    } else {
      // Single object converted to array of 1 row
      list = [data]
    }
  }

  if (!list.length) return { columns: [], rows: [] }

  // Extract all unique column keys
  const columnSet = new Set()
  list.forEach(item => {
    if (item && typeof item === 'object') {
      Object.keys(item).forEach(k => columnSet.add(k))
    }
  })

  const columns = Array.from(columnSet)
  return {
    columns,
    rows: list
  }
}

/**
 * Converts array of objects to CSV string
 */
export function exportToCSV(columns, rows) {
  if (!columns.length || !rows.length) return ''

  const headerRow = columns.map(col => `"${String(col).replace(/"/g, '""')}"`).join(',')
  const dataRows = rows.map(row => {
    return columns.map(col => {
      let val = row[col]
      if (val === undefined || val === null) return '""'
      if (typeof val === 'object') val = JSON.stringify(val)
      return `"${String(val).replace(/"/g, '""')}"`
    }).join(',')
  })

  return [headerRow, ...dataRows].join('\n')
}

/**
 * Finds all paths in JSON structure that match query in key or primitive value
 */
export function findJsonMatches(data, query) {
  if (!query || !query.trim() || data === undefined) return []
  const q = query.trim().toLowerCase()
  const matches = []

  function traverse(node, currentPath, nodeKey) {
    let isMatch = false
    
    // Check if key matches
    if (nodeKey !== null && nodeKey !== undefined && String(nodeKey).toLowerCase().includes(q)) {
      isMatch = true
    }
    
    // Check if primitive value matches
    if (node === null || typeof node !== 'object') {
      if (String(node).toLowerCase().includes(q)) {
        isMatch = true
      }
    }

    if (isMatch) {
      matches.push({
        path: currentPath,
        pathKey: JSON.stringify(currentPath),
        key: nodeKey,
        value: node
      })
    }

    if (node !== null && typeof node === 'object') {
      if (Array.isArray(node)) {
        node.forEach((item, idx) => {
          traverse(item, [...currentPath, idx], idx)
        })
      } else {
        Object.keys(node).forEach(key => {
          traverse(node[key], [...currentPath, key], key)
        })
      }
    }
  }

  traverse(data, [], null)
  return matches
}
