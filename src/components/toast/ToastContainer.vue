<script setup lang="ts">
import { toRefs } from 'vue';
import { toasts, removeToast } from '~/utils/toast';

const { list } = toRefs({ list: toasts });
</script>

<template>
  <div class="toast-portal" aria-live="polite" aria-atomic="true">
    <transition-group name="toast" tag="div" class="toast-list">
      <div v-for="t in list" :key="t.id" class="toast-item" :data-type="t.type" @click="removeToast(t.id)">
        <div class="toast-content">{{ t.message }}</div>
        <button class="toast-close" @click.stop="removeToast(t.id)">✕</button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-portal {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

/* Mobile: center at top */
@media (max-width: 640px) {
  .toast-portal {
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    align-items: center;
  }
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 200px;
  max-width: 360px;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  color: var(--color-primary-foreground);
  box-shadow: var(--shadow-card);
  cursor: pointer;
  overflow: hidden;
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.toast-item[data-type='normal'] {
  background: var(--color-surface-hover);
}
.toast-item[data-type='success'] {
  background: var(--color-success);
}
.toast-item[data-type='warning'] {
  background: var(--color-warning);
}
.toast-item[data-type='error'] {
  background: var(--color-danger);
}

.toast-content {
  flex: 1;
  font-size: 0.95rem;
}
.toast-close {
  background: transparent;
  border: none;
  color: var(--color-primary-foreground);
  font-weight: 600;
  cursor: pointer;
}

/* Animations: desktop slide in from right; mobile slide down from top */
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}
.toast-enter-active,
.toast-leave-active {
  transition:
    transform 220ms ease,
    opacity 220ms ease;
}

.toast-enter-from {
  transform: translateX(100%);
}
.toast-enter-to {
  transform: translateX(0);
  opacity: 1;
}
.toast-leave-from {
  transform: translateX(0);
}
.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@media (max-width: 640px) {
  .toast-enter-from {
    transform: translateY(-100%);
  }
  .toast-leave-to {
    transform: translateY(-100%);
  }
}
</style>
