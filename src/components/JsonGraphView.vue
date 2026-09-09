<template>
  <div class="graph-container" ref="containerRef">
    <!-- Graph Header Toolbar -->
    <div class="graph-header">
      <div class="graph-header-left">
        <div class="graph-title-group">
          <span class="panel-label">Visual Graph</span>
          <span v-if="allNodes.length" class="node-badge">{{ allNodes.length }} nodes</span>
        </div>

        <!-- Graph Search Filter -->
        <div class="search-box">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search nodes..."
            class="search-input"
          />
          <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">✕</button>
          <span v-if="searchQuery && matchedNodeIds.length" class="search-count-pill">
            {{ matchedNodeIds.length }}
          </span>
        </div>
      </div>

      <!-- Controls -->
      <div class="graph-controls">
        <!-- Layout Mode Toggle -->
        <div class="segmented-control">
          <button
            class="segment-btn"
            :class="{ active: layoutMode === 'horizontal' }"
            @click="layoutMode = 'horizontal'"
            title="Horizontal Mindmap Layout"
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="15" y2="6"></line>
              <line x1="3" y1="18" x2="15" y2="18"></line>
            </svg>
            <span>Mindmap</span>
          </button>
          <button
            class="segment-btn"
            :class="{ active: layoutMode === 'vertical' }"
            @click="layoutMode = 'vertical'"
            title="Vertical Tree Layout"
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="3" x2="12" y2="21"></line>
              <line x1="6" y1="3" x2="6" y2="15"></line>
              <line x1="18" y1="3" x2="18" y2="15"></line>
            </svg>
            <span>Tree</span>
          </button>
        </div>

        <div class="divider-v"></div>

        <!-- Zoom Controls -->
        <button class="btn btn-ghost btn-sm icon-btn" @click="zoomIn" title="Zoom In (+)">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>

        <span class="zoom-text">{{ Math.round(zoomScale * 100) }}%</span>

        <button class="btn btn-ghost btn-sm icon-btn" @click="zoomOut" title="Zoom Out (-)">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>

        <button class="btn btn-ghost btn-sm" @click="fitToScreen" title="Fit Entire Graph to Screen">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
          <span>Fit</span>
        </button>

        <button class="btn btn-ghost btn-sm" @click="resetView" title="Reset to 100%">
          <span>1:1</span>
        </button>

        <div class="divider-v"></div>

        <!-- Expand / Collapse All -->
        <button class="btn btn-ghost btn-sm" @click="expandAllNodes" title="Expand All Branches">
          <span>Expand All</span>
        </button>
        <button class="btn btn-ghost btn-sm" @click="collapseAllNodes" title="Collapse to Level 1">
          <span>Collapse</span>
        </button>

        <div class="divider-v"></div>

        <!-- Export SVG -->
        <button class="btn btn-ghost btn-sm" @click="exportSvg" title="Export Diagram as SVG image">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Export SVG</span>
        </button>
      </div>
    </div>

    <!-- Main Canvas Viewport -->
    <div
      class="graph-viewport"
      ref="viewportRef"
      @mousedown="startPan"
      @mousemove="onPan"
      @mouseup="endPan"
      @mouseleave="endPan"
      @wheel.prevent="onWheelZoom"
    >
      <div v-if="parsedData !== null && parsedData !== undefined" class="graph-canvas-wrapper">
        <svg
          class="graph-svg"
          ref="svgRef"
          :style="{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
            transformOrigin: '0 0'
          }"
        >
          <!-- Grid Background Patterns -->
          <defs>
            <pattern id="graph-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="16" cy="16" r="1" fill="var(--border-subtle)" opacity="0.6" />
            </pattern>
          </defs>

          <!-- Edge Connections (Curved Cubic Bezier Paths) -->
          <g class="edges-layer">
            <path
              v-for="edge in visibleEdges"
              :key="edge.id"
              :d="edge.d"
              class="edge-path"
              :class="{ 'edge-highlighted': edge.isHighlighted }"
            />
          </g>

          <!-- Node Cards (ForeignObject for rich HTML cards inside SVG) -->
          <g class="nodes-layer">
            <foreignObject
              v-for="node in visibleNodes"
              :key="node.id"
              :x="node.x"
              :y="node.y"
              :width="node.width"
              :height="node.height"
              class="node-foreign-object"
            >
              <div
                class="graph-node-card"
                :class="{
                  'node-selected': selectedNode?.id === node.id,
                  'node-matched': matchedNodeIds.includes(node.id),
                  [`node-type-${node.type}`]: true
                }"
                @click.stop="selectNode(node)"
              >
                <!-- Card Header -->
                <div class="card-header">
                  <div class="card-header-left">
                    <span class="type-badge" :class="`badge-${node.type}`">{{ node.type }}</span>
                    <span class="card-title" :title="node.key">{{ node.key }}</span>
                  </div>

                  <!-- Item / Property Count -->
                  <div class="card-header-right">
                    <span v-if="node.itemCount !== undefined" class="count-badge">
                      {{ node.itemCount }} {{ node.type === 'array' ? 'items' : 'keys' }}
                    </span>
                  </div>
                </div>

                <!-- Preview Items for Object / Array -->
                <div v-if="node.previewProps && node.previewProps.length" class="card-preview-list">
                  <div
                    v-for="(prop, pIdx) in node.previewProps"
                    :key="pIdx"
                    class="preview-prop-row"
                  >
                    <span class="prop-key">{{ prop.k }}:</span>
                    <span class="prop-val" :class="`val-${prop.type}`">{{ prop.preview }}</span>
                  </div>
                  <div v-if="node.extraCount > 0" class="preview-more-row">
                    +{{ node.extraCount }} more...
                  </div>
                </div>

                <!-- Value for Primitive Nodes -->
                <div v-else-if="node.type !== 'object' && node.type !== 'array'" class="card-primitive-val">
                  <span :class="`val-${node.type}`">{{ node.formattedVal }}</span>
                </div>

                <!-- Expand / Collapse Toggle Button -->
                <button
                  v-if="node.hasChildren"
                  class="node-collapse-toggle"
                  :class="{ collapsed: collapsedNodeIds.has(node.id) }"
                  @click.stop="toggleNodeCollapse(node.id)"
                  :title="collapsedNodeIds.has(node.id) ? 'Expand Subtree' : 'Collapse Subtree'"
                >
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="3">
                    <line v-if="collapsedNodeIds.has(node.id)" x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
            </foreignObject>
          </g>
        </svg>

        <!-- Node Inspector Drawer / Card -->
        <transition name="slide-fade">
          <div v-if="selectedNode" class="node-inspector">
            <div class="inspector-header">
              <div class="inspector-title-group">
                <span class="type-badge" :class="`badge-${selectedNode.type}`">{{ selectedNode.type }}</span>
                <h4>{{ selectedNode.key }}</h4>
              </div>
              <button class="close-inspector-btn" @click="selectedNode = null">✕</button>
            </div>

            <div class="inspector-body">
              <!-- JSONPath -->
              <div class="inspector-field">
                <label>JSONPath</label>
                <div class="path-display">
                  <code>{{ selectedNodeJsonPath }}</code>
                  <button class="btn btn-ghost btn-xs" @click="copyPath(selectedNodeJsonPath)" title="Copy JSONPath">
                    Copy
                  </button>
                </div>
              </div>

              <!-- Node Summary Stats -->
              <div class="inspector-stats-row">
                <div class="stat-item">
                  <span class="stat-lbl">Type</span>
                  <span class="stat-val font-mono">{{ selectedNode.type }}</span>
                </div>
                <div v-if="selectedNode.itemCount !== undefined" class="stat-item">
                  <span class="stat-lbl">Size</span>
                  <span class="stat-val font-mono">{{ selectedNode.itemCount }} {{ selectedNode.type === 'array' ? 'items' : 'keys' }}</span>
                </div>
              </div>

              <!-- JSON Preview -->
              <div class="inspector-field">
                <div class="field-header-row">
                  <label>Value Preview</label>
                  <button class="btn btn-ghost btn-xs" @click="copyNodeValue(selectedNode.rawVal)" title="Copy JSON Value">
                    Copy JSON
                  </button>
                </div>
                <pre class="inspector-json-pre"><code>{{ formatNodeVal(selectedNode.rawVal) }}</code></pre>
              </div>
            </div>
          </div>
        </transition>

        <!-- Canvas Hint Overlay -->
        <div class="canvas-help-hint">
          <span>Drag to pan · Scroll to zoom · Click node to inspect</span>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="3"></circle>
            <circle cx="4" cy="12" r="2"></circle>
            <circle cx="20" cy="12" r="2"></circle>
            <circle cx="12" cy="4" r="2"></circle>
            <circle cx="12" cy="20" r="2"></circle>
            <line x1="6" y1="12" x2="9" y2="12"></line>
            <line x1="15" y1="12" x2="18" y2="12"></line>
            <line x1="12" y1="6" x2="12" y2="9"></line>
            <line x1="12" y1="15" x2="12" y2="18"></line>
          </svg>
        </div>
        <h3>No Valid JSON Parsed</h3>
        <p>Paste or type JSON in the editor to view its interactive visual node diagram.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { buildPath } from '../utils/jsonUtils'

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

const containerRef = ref(null)
const viewportRef = ref(null)
const svgRef = ref(null)

// Navigation & Layout States
const layoutMode = ref('horizontal') // 'horizontal' | 'vertical'
const searchQuery = ref('')
const selectedNode = ref(null)
const collapsedNodeIds = ref(new Set())

// Pan & Zoom
const panOffset = ref({ x: 60, y: 80 })
const zoomScale = ref(1.0)
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })

// Card geometry constants
const CARD_WIDTH = 210
const HORIZONTAL_GAP_X = 90
const HORIZONTAL_GAP_Y = 24
const VERTICAL_GAP_X = 28
const VERTICAL_GAP_Y = 80

/**
 * Parses raw JSON tree into hierarchical graph node structure
 */
function buildGraphHierarchy(data, key = 'root', path = [], depth = 0) {
  const id = JSON.stringify(path)
  const isObj = data !== null && typeof data === 'object' && !Array.isArray(data)
  const isArr = Array.isArray(data)
  
  let type = 'null'
  if (data === null) type = 'null'
  else if (isArr) type = 'array'
  else if (isObj) type = 'object'
  else type = typeof data

  let itemCount = undefined
  let previewProps = []
  let extraCount = 0
  let children = []

  if (isObj) {
    const keys = Object.keys(data)
    itemCount = keys.length
    const previewKeys = keys.slice(0, 4)
    extraCount = Math.max(0, keys.length - 4)
    previewProps = previewKeys.map(k => {
      const val = data[k]
      let pType = val === null ? 'null' : Array.isArray(val) ? 'array' : typeof val
      let pPreview = val === null ? 'null' : typeof val === 'object' ? (Array.isArray(val) ? `[${val.length}]` : '{...}') : String(val)
      if (typeof val === 'string') pPreview = `"${pPreview}"`
      return { k, preview: pPreview, type: pType }
    })

    keys.forEach(k => {
      children.push(buildGraphHierarchy(data[k], k, [...path, k], depth + 1))
    })
  } else if (isArr) {
    itemCount = data.length
    const previewItems = data.slice(0, 4)
    extraCount = Math.max(0, data.length - 4)
    previewProps = previewItems.map((item, idx) => {
      let pType = item === null ? 'null' : Array.isArray(item) ? 'array' : typeof item
      let pPreview = item === null ? 'null' : typeof item === 'object' ? (Array.isArray(item) ? `[${item.length}]` : '{...}') : String(item)
      if (typeof item === 'string') pPreview = `"${pPreview}"`
      return { k: `[${idx}]`, preview: pPreview, type: pType }
    })

    data.forEach((item, idx) => {
      children.push(buildGraphHierarchy(item, `[${idx}]`, [...path, idx], depth + 1))
    })
  }

  // Calculate card height based on preview list
  let cardHeight = 64
  if (previewProps.length > 0) {
    cardHeight = 46 + previewProps.length * 20 + (extraCount > 0 ? 18 : 0)
  }

  let formattedVal = ''
  if (!isObj && !isArr) {
    formattedVal = data === null ? 'null' : typeof data === 'string' ? `"${data}"` : String(data)
  }

  return {
    id,
    key,
    path,
    depth,
    type,
    itemCount,
    previewProps,
    extraCount,
    formattedVal,
    rawVal: data,
    children,
    hasChildren: children.length > 0,
    width: CARD_WIDTH,
    height: cardHeight,
    x: 0,
    y: 0
  }
}

const rootNode = computed(() => {
  if (props.parsedData === null || props.parsedData === undefined) return null
  return buildGraphHierarchy(props.parsedData, 'root', [], 0)
})

/**
 * Layout calculation for Horizontal and Vertical tree views
 */
const layoutResult = computed(() => {
  if (!rootNode.value) return { nodes: [], edges: [], allNodes: [] }

  const allNodesList = []
  const visibleNodesList = []
  const edgesList = []

  // Collect all nodes
  function collectAll(n) {
    allNodesList.push(n)
    n.children.forEach(collectAll)
  }
  collectAll(rootNode.value)

  if (layoutMode.value === 'horizontal') {
    // Horizontal Layout (Left-to-Right)
    let currentLeafY = 0

    function computeSubtreeLayout(node) {
      const isCollapsed = collapsedNodeIds.value.has(node.id)
      const visibleChildren = isCollapsed ? [] : node.children

      if (visibleChildren.length === 0) {
        node.x = node.depth * (CARD_WIDTH + HORIZONTAL_GAP_X)
        node.y = currentLeafY
        currentLeafY += node.height + HORIZONTAL_GAP_Y
      } else {
        visibleChildren.forEach(child => computeSubtreeLayout(child))
        node.x = node.depth * (CARD_WIDTH + HORIZONTAL_GAP_X)
        const firstChild = visibleChildren[0]
        const lastChild = visibleChildren[visibleChildren.length - 1]
        node.y = (firstChild.y + (firstChild.height / 2) + lastChild.y + (lastChild.height / 2)) / 2 - (node.height / 2)
      }

      visibleNodesList.push(node)

      // Create edges to visible children
      visibleChildren.forEach(child => {
        const startX = node.x + node.width
        const startY = node.y + (node.height / 2)
        const endX = child.x
        const endY = child.y + (child.height / 2)
        const midX = (startX + endX) / 2

        const d = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`
        edgesList.push({
          id: `${node.id}->${child.id}`,
          d,
          isHighlighted: matchedNodeIds.value.includes(child.id) || selectedNode.value?.id === child.id
        })
      })
    }

    computeSubtreeLayout(rootNode.value)
  } else {
    // Vertical Layout (Top-to-Bottom)
    let currentLeafX = 0

    function computeSubtreeLayoutV(node) {
      const isCollapsed = collapsedNodeIds.value.has(node.id)
      const visibleChildren = isCollapsed ? [] : node.children

      if (visibleChildren.length === 0) {
        node.y = node.depth * (100 + VERTICAL_GAP_Y)
        node.x = currentLeafX
        currentLeafX += node.width + VERTICAL_GAP_X
      } else {
        visibleChildren.forEach(child => computeSubtreeLayoutV(child))
        node.y = node.depth * (100 + VERTICAL_GAP_Y)
        const firstChild = visibleChildren[0]
        const lastChild = visibleChildren[visibleChildren.length - 1]
        node.x = (firstChild.x + (firstChild.width / 2) + lastChild.x + (lastChild.width / 2)) / 2 - (node.width / 2)
      }

      visibleNodesList.push(node)

      visibleChildren.forEach(child => {
        const startX = node.x + (node.width / 2)
        const startY = node.y + node.height
        const endX = child.x + (child.width / 2)
        const endY = child.y
        const midY = (startY + endY) / 2

        const d = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`
        edgesList.push({
          id: `${node.id}->${child.id}`,
          d,
          isHighlighted: matchedNodeIds.value.includes(child.id) || selectedNode.value?.id === child.id
        })
      })
    }

    computeSubtreeLayoutV(rootNode.value)
  }

  return {
    nodes: visibleNodesList,
    edges: edgesList,
    allNodes: allNodesList
  }
})

const visibleNodes = computed(() => layoutResult.value.nodes)
const visibleEdges = computed(() => layoutResult.value.edges)
const allNodes = computed(() => layoutResult.value.allNodes)

// Search matching
const matchedNodeIds = computed(() => {
  if (!searchQuery.value || !searchQuery.value.trim()) return []
  const q = searchQuery.value.trim().toLowerCase()
  return allNodes.value
    .filter(n => {
      const matchKey = String(n.key).toLowerCase().includes(q)
      const matchVal = String(n.formattedVal || '').toLowerCase().includes(q)
      return matchKey || matchVal
    })
    .map(n => n.id)
})

// Auto-expand ancestors when searching
watch(searchQuery, (newQuery) => {
  if (!newQuery || !newQuery.trim()) return
  matchedNodeIds.value.forEach(id => {
    const node = allNodes.value.find(n => n.id === id)
    if (node) {
      for (let i = 1; i <= node.path.length; i++) {
        const subPath = node.path.slice(0, i - 1)
        collapsedNodeIds.value.delete(JSON.stringify(subPath))
      }
    }
  })
})

const selectedNodeJsonPath = computed(() => {
  if (!selectedNode.value) return '$'
  return buildPath(selectedNode.value.path, 'jsonpath')
})

function selectNode(node) {
  selectedNode.value = node
}

function toggleNodeCollapse(nodeId) {
  if (collapsedNodeIds.value.has(nodeId)) {
    collapsedNodeIds.value.delete(nodeId)
  } else {
    collapsedNodeIds.value.add(nodeId)
  }
}

function expandAllNodes() {
  collapsedNodeIds.value.clear()
}

function collapseAllNodes() {
  const set = new Set()
  allNodes.value.forEach(n => {
    if (n.depth >= 1 && n.hasChildren) {
      set.add(n.id)
    }
  })
  collapsedNodeIds.value = set
}

// Pan & Zoom Event Handlers
function startPan(e) {
  if (e.target.closest('.node-foreign-object') || e.target.closest('.node-inspector')) return
  isPanning.value = true
  panStart.value = {
    x: e.clientX - panOffset.value.x,
    y: e.clientY - panOffset.value.y
  }
}

function onPan(e) {
  if (!isPanning.value) return
  panOffset.value = {
    x: e.clientX - panStart.value.x,
    y: e.clientY - panStart.value.y
  }
}

function endPan() {
  isPanning.value = false
}

function onWheelZoom(e) {
  const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9
  const newScale = Math.min(Math.max(zoomScale.value * zoomFactor, 0.2), 3.0)
  
  if (viewportRef.value) {
    const rect = viewportRef.value.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    panOffset.value = {
      x: mouseX - (mouseX - panOffset.value.x) * (newScale / zoomScale.value),
      y: mouseY - (mouseY - panOffset.value.y) * (newScale / zoomScale.value)
    }
  }

  zoomScale.value = newScale
}

function zoomIn() {
  zoomScale.value = Math.min(zoomScale.value * 1.2, 3.0)
}

function zoomOut() {
  zoomScale.value = Math.max(zoomScale.value * 0.8, 0.2)
}

function resetView() {
  zoomScale.value = 1.0
  panOffset.value = { x: 60, y: 80 }
}

function fitToScreen() {
  if (!visibleNodes.value.length || !viewportRef.value) return

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  visibleNodes.value.forEach(n => {
    minX = Math.min(minX, n.x)
    minY = Math.min(minY, n.y)
    maxX = Math.max(maxX, n.x + n.width)
    maxY = Math.max(maxY, n.y + n.height)
  })

  const padding = 60
  const width = maxX - minX + padding * 2
  const height = maxY - minY + padding * 2

  const rect = viewportRef.value.getBoundingClientRect()
  const scaleX = rect.width / width
  const scaleY = rect.height / height
  const fitScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.25), 1.2)

  zoomScale.value = fitScale
  panOffset.value = {
    x: (rect.width - width * fitScale) / 2 - minX * fitScale + padding * fitScale,
    y: (rect.height - height * fitScale) / 2 - minY * fitScale + padding * fitScale
  }
}

// Copy & Format Helpers
function formatNodeVal(val) {
  if (val === undefined) return 'undefined'
  try {
    return JSON.stringify(val, null, 2)
  } catch {
    return String(val)
  }
}

async function copyPath(path) {
  try {
    await navigator.clipboard.writeText(path)
    emit('toast', `Copied JSONPath: ${path}`, 'success')
  } catch {
    emit('toast', 'Failed to copy path', 'error')
  }
}

async function copyNodeValue(val) {
  try {
    const text = typeof val === 'object' && val !== null ? JSON.stringify(val, null, 2) : String(val)
    await navigator.clipboard.writeText(text)
    emit('toast', 'Copied value to clipboard', 'success')
  } catch {
    emit('toast', 'Failed to copy', 'error')
  }
}

function exportSvg() {
  if (!svgRef.value) return

  try {
    const svgClone = svgRef.value.cloneNode(true)
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    svgClone.style.transform = 'none'

    const svgData = new XMLSerializer().serializeToString(svgClone)
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `json-graph-${Date.now()}.svg`
    a.click()
    URL.revokeObjectURL(url)

    emit('toast', 'SVG Diagram exported successfully', 'success')
  } catch (e) {
    console.error('Export SVG failed', e)
    emit('toast', 'Failed to export SVG', 'error')
  }
}

onMounted(() => {
  nextTick(() => {
    const initCollapsed = new Set()
    allNodes.value.forEach(n => {
      if (n.depth >= 2 && n.hasChildren) {
        initCollapsed.add(n.id)
      }
    })
    collapsedNodeIds.value = initCollapsed
  })
})
</script>

<style scoped>
.graph-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  overflow: hidden;
  position: relative;
}

.graph-header {
  height: var(--toolbar-height);
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface-elevated);
  gap: 12px;
  z-index: 10;
}

.graph-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.graph-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-badge {
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  padding: 2px 8px;
  border-radius: 12px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 3px 8px;
  width: 200px;
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

.search-count-pill {
  font-size: 10px;
  font-family: var(--font-mono);
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  padding: 1px 5px;
  border-radius: 4px;
}

.clear-search-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 10px;
}

.graph-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.segmented-control {
  display: flex;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 2px;
  gap: 2px;
}

.segment-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 11px;
  font-family: var(--font-sans);
  padding: 2px 8px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.12s ease;
}

.segment-btn.active {
  background: var(--bg-surface-elevated);
  color: var(--text-main);
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.divider-v {
  width: 1px;
  height: 16px;
  background: var(--border-subtle);
  margin: 0 4px;
}

.icon-btn {
  width: 26px;
  height: 26px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoom-text {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-muted);
  min-width: 36px;
  text-align: center;
}

/* Canvas Viewport */
.graph-viewport {
  flex: 1;
  position: relative;
  overflow: hidden;
  cursor: grab;
  background-color: var(--bg-surface);
  background-image: radial-gradient(var(--border-subtle) 1px, transparent 1px);
  background-size: 24px 24px;
  user-select: none;
}

.graph-viewport:active {
  cursor: grabbing;
}

.graph-canvas-wrapper {
  width: 100%;
  height: 100%;
}

.graph-svg {
  width: 5000px;
  height: 5000px;
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: all;
}

/* Edge Lines */
.edge-path {
  fill: none;
  stroke: var(--border-subtle);
  stroke-width: 1.5;
  transition: stroke 0.15s ease, stroke-width 0.15s ease;
}

.edge-highlighted {
  stroke: #f59e0b;
  stroke-width: 2.2;
}

/* Node ForeignObject */
.node-foreign-object {
  overflow: visible;
}

.graph-node-card {
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 8px 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: transform 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease;
  position: relative;
  color: var(--text-main);
  box-sizing: border-box;
}

.graph-node-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
}

.graph-node-card.node-selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary), 0 8px 20px rgba(99, 102, 241, 0.25);
}

.graph-node-card.node-matched {
  border-color: #f59e0b;
  box-shadow: 0 0 0 2px #f59e0b, 0 8px 20px rgba(245, 158, 11, 0.25);
}

/* Node Header */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 4px;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
}

.card-title {
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--syn-key);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.type-badge {
  font-size: 9px;
  text-transform: uppercase;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 3px;
}

.badge-object { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
.badge-array { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
.badge-string { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
.badge-number { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.badge-boolean { background: rgba(236, 72, 153, 0.15); color: #f472b6; }
.badge-null { background: rgba(148, 163, 184, 0.15); color: #94a3b8; }

.count-badge {
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--text-muted);
  background: var(--bg-surface);
  padding: 1px 5px;
  border-radius: 4px;
  white-space: nowrap;
}

/* Preview Properties List */
.card-preview-list {
  border-top: 1px dashed var(--border-subtle);
  padding-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-family: var(--font-mono);
  font-size: 11px;
}

.preview-prop-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  line-height: 16px;
}

.prop-key {
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prop-val {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100px;
}

.preview-more-row {
  font-size: 10px;
  color: var(--text-subtle);
  text-align: right;
  font-style: italic;
}

/* Primitive Value */
.card-primitive-val {
  border-top: 1px dashed var(--border-subtle);
  padding-top: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  word-break: break-all;
}

.val-string { color: var(--syn-string); }
.val-number { color: var(--syn-number); }
.val-boolean { color: var(--syn-boolean); font-weight: 600; }
.val-null { color: var(--syn-null); font-weight: 600; }

/* Collapse / Expand Button */
.node-collapse-toggle {
  position: absolute;
  right: -9px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: all 0.12s ease;
  z-index: 5;
}

.node-collapse-toggle:hover {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.node-collapse-toggle.collapsed {
  background: #f59e0b;
  color: #fff;
  border-color: #f59e0b;
}

/* Node Inspector Drawer */
.node-inspector {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 340px;
  max-height: calc(100% - 32px);
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md, 8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  z-index: 20;
  overflow: hidden;
}

.inspector-header {
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface);
}

.inspector-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.inspector-title-group h4 {
  margin: 0;
  font-size: 13px;
  font-family: var(--font-mono);
  color: var(--text-main);
}

.close-inspector-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 13px;
}

.inspector-body {
  padding: 14px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inspector-field label {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  margin-bottom: 4px;
  font-weight: 600;
}

.path-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  font-family: var(--font-mono);
  font-size: 12px;
}

.path-display code {
  color: var(--syn-key);
  word-break: break-all;
}

.inspector-stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.stat-item {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 6px 10px;
  display: flex;
  flex-direction: column;
}

.stat-lbl {
  font-size: 10px;
  color: var(--text-muted);
}

.stat-val {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-main);
}

.field-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.inspector-json-pre {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  max-height: 220px;
  overflow: auto;
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 18px;
  color: var(--text-main);
  margin: 0;
}

/* Bottom Hint Overlay */
.canvas-help-hint {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  color: rgba(255, 255, 255, 0.75);
  font-size: 11px;
  padding: 4px 12px;
  border-radius: 20px;
  pointer-events: none;
  user-select: none;
}

/* Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.18s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* Empty State */
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
