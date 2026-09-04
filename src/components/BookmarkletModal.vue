<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="modal-header-title">
          <div class="modal-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div>
            <h3>Browser Bookmarklet</h3>
            <p>1-Click JSON Formatter for any API in your browser</p>
          </div>
        </div>
        <button class="btn btn-ghost btn-icon-only" @click="$emit('close')">✕</button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <div class="bookmarklet-highlight-box">
          <p class="step-label">👉 Drag this button to your browser's <strong>Bookmarks Bar</strong>:</p>
          
          <div class="draggable-wrapper">
            <a
              :href="bookmarkletCode"
              class="bookmarklet-pill"
              title="Drag me to your Bookmarks Bar!"
              @click.prevent="showDragWarning"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
              <span>✨ Open in JSONShare</span>
            </a>
          </div>

          <span class="drag-hint">Drag & drop onto your browser's bookmarks bar (Cmd+Shift+B / Ctrl+Shift+B)</span>
        </div>

        <!-- How It Works Steps -->
        <div class="how-it-works">
          <h4>How to use it:</h4>
          <ol class="steps-list">
            <li>
              <span class="step-num">1</span>
              <span>Open any raw API or JSON endpoint in your browser (e.g. <code>api.github.com</code> or your local backend).</span>
            </li>
            <li>
              <span class="step-num">2</span>
              <span>Click <strong>"✨ Open in JSONShare"</strong> on your bookmarks bar.</span>
            </li>
            <li>
              <span class="step-num">3</span>
              <span>JSONShare instantly opens in a new tab with the payload formatted, visualized, and ready to share!</span>
            </li>
          </ol>
        </div>

        <!-- Manual Copy Code -->
        <div class="manual-code-section">
          <div class="manual-header">
            <label class="field-label">Or copy the bookmarklet code manually:</label>
            <button class="btn btn-ghost btn-sm" @click="copyBookmarklet">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>{{ isCopied ? 'Copied!' : 'Copy Code' }}</span>
            </button>
          </div>
          <textarea
            readonly
            class="input-text code-snippet"
            :value="bookmarkletCode"
            rows="2"
            @focus="$event.target.select()"
          ></textarea>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <span class="footer-tip">Works on Chrome, Brave, Edge, Safari & Firefox</span>
        <button class="btn btn-ghost" @click="$emit('close')">Done</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['close', 'toast'])

const isCopied = ref(false)

const bookmarkletCode = computed(() => {
  const currentOrigin = window.location.origin + window.location.pathname
  return `javascript:(function(){function getJsonText(){var pre=document.querySelector('pre');if(pre&&pre.innerText){try{JSON.parse(pre.innerText.trim());return pre.innerText.trim();}catch(e){}}var gh=document.querySelectorAll('.react-code-text,.blob-code-inner,table.highlight td.blob-code');if(gh&&gh.length>0){var lines=Array.from(gh).map(function(el){return el.innerText;}).join('\\n');try{JSON.parse(lines.trim());return lines.trim();}catch(e){}}var raw=(document.body.innerText||document.body.textContent||'').trim();try{JSON.parse(raw);return raw;}catch(e){}var start=raw.search(/[{\\[]/);var end=Math.max(raw.lastIndexOf('}'),raw.lastIndexOf(']'));if(start!==-1&&end>start){var candidate=raw.substring(start,end+1);try{JSON.parse(candidate);return candidate;}catch(e){}}return null;}var json=getJsonText();if(!json){alert('JSONShare: No valid JSON found on this page!');return;}var w=window.open('${currentOrigin}','_blank');if(w){w.name='JSONSHARE_DATA:'+json;}})();`
})

function showDragWarning() {
  emit('toast', 'Don’t click! Drag and drop this button into your Bookmarks Bar.', 'warning')
}

async function copyBookmarklet() {
  try {
    await navigator.clipboard.writeText(bookmarkletCode.value)
    isCopied.value = true
    emit('toast', 'Bookmarklet code copied!', 'success')
    setTimeout(() => { isCopied.value = false }, 2500)
  } catch {
    emit('toast', 'Failed to copy', 'error')
  }
}
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

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.bookmarklet-highlight-box {
  background: var(--bg-surface-elevated);
  border: 2px dashed var(--accent-primary);
  border-radius: var(--radius-md);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}

.step-label {
  font-size: 13px;
  color: var(--text-main);
}

.draggable-wrapper {
  padding: 6px;
}

.bookmarklet-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #0db49e 0%, #099280 100%);
  color: #ffffff;
  padding: 10px 20px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: grab;
  box-shadow: 0 4px 14px rgba(13, 180, 158, 0.4);
  user-select: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.bookmarklet-pill:hover {
  transform: scale(1.04);
  box-shadow: 0 6px 20px rgba(13, 180, 158, 0.6);
}

.bookmarklet-pill:active {
  cursor: grabbing;
}

.drag-hint {
  font-size: 11px;
  color: var(--text-muted);
}

.how-it-works {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.how-it-works h4 {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}

.steps-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.steps-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
}

.step-num {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent-primary-glow);
  color: var(--accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 11px;
  flex-shrink: 0;
}

.steps-list code {
  background: var(--bg-surface-elevated);
  padding: 1px 5px;
  border-radius: 3px;
  font-family: var(--font-mono);
  color: var(--accent-primary);
}

.manual-code-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.manual-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
}

.code-snippet {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-app);
  resize: none;
}

.modal-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-surface-elevated);
}

.footer-tip {
  font-size: 11px;
  color: var(--text-subtle);
}
</style>
