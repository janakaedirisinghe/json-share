<template>
  <div class="toast-container" v-if="toasts.length">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast-item"
      :class="`toast-${toast.type || 'info'}`"
    >
      <span class="toast-icon">
        <span v-if="toast.type === 'success'">✓</span>
        <span v-else-if="toast.type === 'error'">✕</span>
        <span v-else-if="toast.type === 'warning'">⚠</span>
        <span v-else>ℹ</span>
      </span>
      <span class="toast-message">{{ toast.message }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])

function showToast(message, type = 'success', duration = 2500) {
  const id = Date.now() + Math.random()
  toasts.value.push({ id, message, type })

  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, duration)
}

defineExpose({ showToast })
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 2000;
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-success {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  border-color: #10b981;
}

.toast-error {
  background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
  border-color: #f43f5e;
}

.toast-warning {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  border-color: #fbbf24;
}

.toast-icon {
  font-weight: bold;
  font-size: 14px;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
