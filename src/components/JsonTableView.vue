<template>
  <div class="table-container">
    <!-- Table Header Toolbar -->
    <div class="table-header">
      <div class="table-info">
        <span class="panel-label">Tabular View</span>
        <span v-if="rows.length" class="row-badge">{{ rows.length }} records · {{ columns.length }} columns</span>
      </div>

      <div class="table-controls">
        <!-- Search filter -->
        <input
          v-if="rows.length"
          type="text"
          v-model="tableFilter"
          placeholder="Filter rows..."
          class="input-text table-filter-input"
        />

        <!-- Export to CSV -->
        <button
          class="btn btn-ghost btn-sm"
          @click="downloadCSV"
          :disabled="!rows.length"
          title="Download Table as CSV"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Export CSV</span>
        </button>
      </div>
    </div>

    <!-- Table Body -->
    <div class="table-body">
      <div v-if="filteredRows.length" class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th class="th-index">#</th>
              <th
                v-for="col in columns"
                :key="col"
                @click="sortBy(col)"
                class="th-sortable"
              >
                <div class="th-content">
                  <span>{{ col }}</span>
                  <span class="sort-icon" v-if="sortColumn === col">
                    {{ sortDirection === 'asc' ? '▲' : '▼' }}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in filteredRows" :key="idx">
              <td class="td-index">{{ idx + 1 }}</td>
              <td v-for="col in columns" :key="col" class="td-cell">
                <span v-if="row[col] === null" class="cell-null">null</span>
                <span v-else-if="typeof row[col] === 'boolean'" class="cell-bool">{{ row[col] }}</span>
                <span v-else-if="typeof row[col] === 'object'" class="cell-object">
                  {{ Array.isArray(row[col]) ? `Array(${row[col].length})` : '{Object}' }}
                </span>
                <span v-else>{{ row[col] }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-table-state">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="3" y1="15" x2="21" y2="15"></line>
          <line x1="9" y1="3" x2="9" y2="21"></line>
          <line x1="15" y1="3" x2="15" y2="21"></line>
        </svg>
        <h3>No Array Data Found</h3>
        <p>Table View displays arrays of objects. Try loading the "E-Commerce Order Feed" sample to test it.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { extractTableData, exportToCSV } from '../utils/jsonUtils'

const props = defineProps({
  parsedData: {
    type: [Object, Array, String, Number, Boolean, null],
    default: null
  }
})

const emit = defineEmits(['toast'])

const tableFilter = ref('')
const sortColumn = ref(null)
const sortDirection = ref('asc')

const tableData = computed(() => {
  return extractTableData(props.parsedData)
})

const columns = computed(() => tableData.value.columns)
const rows = computed(() => tableData.value.rows)

const filteredRows = computed(() => {
  let list = [...rows.value]

  if (tableFilter.value.trim()) {
    const q = tableFilter.value.toLowerCase()
    list = list.filter(row => {
      return Object.values(row).some(v => String(v).toLowerCase().includes(q))
    })
  }

  if (sortColumn.value) {
    list.sort((a, b) => {
      let va = a[sortColumn.value]
      let vb = b[sortColumn.value]
      if (va === vb) return 0
      if (va === null || va === undefined) return 1
      if (vb === null || vb === undefined) return -1
      const res = va > vb ? 1 : -1
      return sortDirection.value === 'asc' ? res : -res
    })
  }

  return list
})

function sortBy(col) {
  if (sortColumn.value === col) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = col
    sortDirection.value = 'asc'
  }
}

function downloadCSV() {
  const csvContent = exportToCSV(columns.value, rows.value)
  if (!csvContent) return

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `jsonshare-table-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
  emit('toast', 'CSV exported successfully', 'success')
}
</script>

<style scoped>
.table-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  overflow: hidden;
}

.table-header {
  height: var(--toolbar-height);
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface-elevated);
}

.table-info {
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

.row-badge {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-subtle);
}

.table-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-filter-input {
  font-size: 12px;
  padding: 4px 8px;
  width: 160px;
}

.table-body {
  flex: 1;
  overflow: auto;
  position: relative;
}

.table-wrapper {
  min-width: 100%;
  overflow: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  font-family: var(--font-mono);
  text-align: left;
}

.data-table th, .data-table td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-subtle);
  white-space: nowrap;
}

.data-table th {
  background: var(--bg-surface-elevated);
  color: var(--text-muted);
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
  user-select: none;
}

.th-index, .td-index {
  width: 40px;
  text-align: center;
  color: var(--text-subtle);
  font-size: 11px;
}

.th-sortable {
  cursor: pointer;
}

.th-sortable:hover {
  color: var(--text-main);
}

.th-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sort-icon {
  font-size: 10px;
  color: var(--accent-primary);
}

.data-table tbody tr:hover {
  background-color: var(--bg-surface-hover);
}

.cell-null {
  color: var(--syn-null);
  font-weight: 600;
}

.cell-bool {
  color: var(--syn-boolean);
  font-weight: 600;
}

.cell-object {
  color: var(--syn-bracket);
  font-size: 11px;
}

.empty-table-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  text-align: center;
  gap: 8px;
  padding: 24px;
}

.empty-table-state h3 {
  font-size: 15px;
  color: var(--text-main);
}

.empty-table-state p {
  font-size: 13px;
  max-width: 320px;
}
</style>
