<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="modal-header-title">
          <div class="modal-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </div>
          <div>
            <h3>Share JSON Payload</h3>
            <p>Choose your preferred sharing mode</p>
          </div>
        </div>
        <button class="btn btn-ghost btn-icon-only" @click="$emit('close')">✕</button>
      </div>

      <!-- Mode Selector Tabs -->
      <div class="share-tabs">
        <button
          class="share-tab-btn"
          :class="{ active: shareMode === 'short' }"
          @click="shareMode = 'short'"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          <span>⚡ Short Link (~35 chars)</span>
        </button>

        <button
          class="share-tab-btn"
          :class="{ active: shareMode === 'private' }"
          @click="shareMode = 'private'"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>🔒 Private In-URL Link</span>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <!-- SHORT LINK MODE -->
        <div v-if="shareMode === 'short'" class="tab-content">
          <div class="privacy-alert alert-short">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            <span>Creates a tiny URL (under 40 chars) ideal for Slack, Teams, Discord, and chat.</span>
          </div>

          <div v-if="!shortUrl" class="short-link-cta">
            <p>Generate a compact, shareable link for this {{ formatBytes(jsonBytes) }} document:</p>
            <button
              class="btn btn-primary btn-lg"
              @click="handleCreateShortLink"
              :disabled="isGeneratingShortLink"
            >
              <span v-if="isGeneratingShortLink" class="spinner"></span>
              <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              <span>{{ isGeneratingShortLink ? 'Generating Short Link...' : 'Create Short Link' }}</span>
            </button>
          </div>

          <div v-else class="share-field-group">
            <label class="field-label">Short Shareable URL</label>
            <div class="share-url-container">
              <input
                type="text"
                readonly
                :value="shortUrl"
                class="input-text share-url-input"
                @focus="$event.target.select()"
              />
              <button class="btn btn-primary" @click="copyText(shortUrl, 'Short link copied!')">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>{{ isCopied ? 'Copied!' : 'Copy Link' }}</span>
              </button>
            </div>
            <span class="url-hint">Length: {{ shortUrl.length }} characters</span>
          </div>
        </div>

        <!-- PRIVATE FULL IN-URL MODE -->
        <div v-else class="tab-content">
          <div class="privacy-alert">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>100% Zero-Backend. Compressed directly in URL fragment. Never leaves your browser.</span>
          </div>

          <div class="share-field-group">
            <div class="field-header-row">
              <label class="field-label">In-URL Compressed Link</label>
              <span class="url-size-badge" :class="urlHealthClass">{{ urlHealthLabel }}</span>
            </div>
            <div class="share-url-container">
              <input
                type="text"
                readonly
                :value="generatedUrl"
                class="input-text share-url-input"
                @focus="$event.target.select()"
              />
              <button class="btn btn-primary" @click="copyText(generatedUrl, 'Full URL copied!')">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>{{ isCopied ? 'Copied!' : 'Copy Link' }}</span>
              </button>
            </div>
          </div>

          <!-- Password Encryption Option -->
          <div class="protection-section">
            <div class="protection-toggle" @click="enablePassword = !enablePassword">
              <input type="checkbox" v-model="enablePassword" />
              <span class="toggle-text">Encrypt with Password (AES-GCM 256-bit)</span>
            </div>

            <div v-if="enablePassword" class="password-input-wrapper">
              <input
                type="password"
                v-model="password"
                placeholder="Enter secret password..."
                class="input-text password-input"
                @input="onPasswordChange"
              />
              <button class="btn btn-emerald btn-sm" @click="applyPasswordEncryption">
                Apply Encryption
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile QR Code Preview -->
        <div class="qr-section">
          <button class="btn btn-ghost btn-sm" @click="showQr = !showQr">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>{{ showQr ? 'Hide QR Code' : 'Show Mobile QR Code' }}</span>
          </button>

          <div v-if="showQr" class="qr-canvas-wrapper">
            <canvas ref="qrCanvasRef" class="qr-canvas"></canvas>
            <span class="qr-hint">Scan with mobile camera</span>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <span class="link-length-badge">
          {{ shareMode === 'short' && shortUrl ? shortUrl.length : generatedUrl.length }} chars in URL
        </span>
        <button class="btn btn-ghost" @click="$emit('close')">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useUrlShare } from '../composables/useUrlShare'
import { formatBytes } from '../utils/jsonUtils'

const props = defineProps({
  rawJson: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'toast'])

const { generateShareUrl, generateShortLink } = useUrlShare()

const shareMode = ref('short') // 'short' | 'private'
const generatedUrl = ref('')
const shortUrl = ref('')
const isGeneratingShortLink = ref(false)
const isCopied = ref(false)
const enablePassword = ref(false)
const password = ref('')
const showQr = ref(false)
const qrCanvasRef = ref(null)

const jsonBytes = computed(() => {
  return new Blob([props.rawJson]).size
})

const activeUrlToDisplay = computed(() => {
  return (shareMode.value === 'short' && shortUrl.value) ? shortUrl.value : generatedUrl.value
})

const urlHealthLabel = computed(() => {
  const len = generatedUrl.value.length
  if (len < 1500) return '✓ Compact URL'
  if (len < 6000) return 'Medium Size'
  return '⚠️ Large URL (Short Link Recommended)'
})

const urlHealthClass = computed(() => {
  const len = generatedUrl.value.length
  if (len < 1500) return 'badge-health-green'
  if (len < 6000) return 'badge-health-amber'
  return 'badge-health-orange'
})

async function createPrivateLink() {
  const res = await generateShareUrl(props.rawJson, enablePassword.value ? password.value : '')
  generatedUrl.value = res.url
  if (showQr.value) {
    drawQr()
  }
}

async function handleCreateShortLink() {
  isGeneratingShortLink.value = true
  try {
    const res = await generateShortLink(props.rawJson)
    shortUrl.value = res.url
    emit('toast', 'Short link created successfully!', 'success')
    if (showQr.value) {
      drawQr()
    }
  } catch (err) {
    emit('toast', err.message || 'Failed to create short link', 'error')
  } finally {
    isGeneratingShortLink.value = false
  }
}

async function applyPasswordEncryption() {
  if (!password.value.trim()) {
    emit('toast', 'Please enter a password', 'warning')
    return
  }
  await createPrivateLink()
  emit('toast', 'Encrypted link generated!', 'success')
}

function onPasswordChange() {
  if (!password.value) {
    createPrivateLink()
  }
}

watch(enablePassword, (val) => {
  if (!val) {
    password.value = ''
    createPrivateLink()
  }
})

watch(showQr, (val) => {
  if (val) {
    nextTick(() => drawQr())
  }
})

watch(activeUrlToDisplay, () => {
  if (showQr.value) {
    drawQr()
  }
})

async function drawQr() {
  const urlToRender = activeUrlToDisplay.value
  if (!qrCanvasRef.value || !urlToRender) return
  try {
    const QRCode = await import('qrcode')
    const qr = QRCode.default || QRCode
    qr.toCanvas(qrCanvasRef.value, urlToRender, {
      width: 170,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    }, (error) => {
      if (error) console.warn('QR render error:', error)
    })
  } catch (e) {
    console.warn('QR Code library not loaded', e)
  }
}

async function copyText(text, successMsg = 'Copied to clipboard!') {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    isCopied.value = true
    emit('toast', successMsg, 'success')
    setTimeout(() => { isCopied.value = false }, 2500)
  } catch {
    emit('toast', 'Failed to copy URL', 'error')
  }
}

onMounted(() => {
  createPrivateLink()
})
</script>

<style scoped>
.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-surface-elevated);
}

.modal-header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--accent-primary-glow);
  color: var(--accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-header-title h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
}

.modal-header-title p {
  font-size: 12px;
  color: var(--text-muted);
}

.share-tabs {
  display: flex;
  background: var(--bg-surface-elevated);
  border-bottom: 1px solid var(--border-subtle);
  padding: 6px 16px 0;
  gap: 8px;
}

.share-tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.share-tab-btn:hover {
  color: var(--text-main);
}

.share-tab-btn.active {
  color: var(--accent-primary);
  border-bottom-color: var(--accent-primary);
  font-weight: 600;
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.privacy-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  color: var(--accent-cyan);
  font-size: 12px;
  line-height: 1.4;
}

.alert-short {
  background: rgba(13, 180, 158, 0.1);
  border-color: rgba(13, 180, 158, 0.25);
  color: #0db49e;
}

.short-link-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--bg-surface-elevated);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-subtle);
  text-align: center;
}

.short-link-cta p {
  font-size: 13px;
  color: var(--text-muted);
}

.btn-lg {
  padding: 10px 20px;
  font-size: 14px;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.share-field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
}

.url-size-badge {
  font-size: 11px;
  font-family: var(--font-mono);
  padding: 2px 6px;
  border-radius: var(--radius-full);
}

.badge-health-green {
  background: rgba(52, 211, 153, 0.15);
  color: var(--accent-emerald);
}

.badge-health-amber {
  background: rgba(251, 191, 36, 0.15);
  color: var(--accent-amber);
}

.badge-health-orange {
  background: rgba(244, 114, 182, 0.15);
  color: var(--accent-rose);
}

.share-url-container {
  display: flex;
  gap: 8px;
}

.share-url-input {
  flex: 1;
  font-family: var(--font-mono);
  font-size: 12px;
  background: var(--bg-app);
}

.url-hint {
  font-size: 11px;
  color: var(--text-subtle);
  font-family: var(--font-mono);
}

.protection-section {
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.protection-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.toggle-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-main);
}

.password-input-wrapper {
  display: flex;
  gap: 8px;
}

.password-input {
  flex: 1;
}

.qr-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.qr-canvas-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  padding: 12px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}

.qr-canvas {
  width: 170px;
  height: 170px;
}

.qr-hint {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

.modal-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-surface-elevated);
}

.link-length-badge {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-subtle);
}
</style>
