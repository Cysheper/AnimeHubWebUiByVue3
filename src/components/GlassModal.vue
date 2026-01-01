<template>
  <transition name="modal">
    <div v-if="modelValue" class="modal-overlay" @click="close">
      <div class="modal-container glass" @click.stop>
        <button class="modal-close" @click="close">✕</button>
        <div v-if="title" class="modal-header">
          <h2 class="modal-title">{{ title }}</h2>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div v-if="$slots.footer" class="modal-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  closeOnOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  closeOnOverlay: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const close = () => {
  if (props.closeOnOverlay) {
    emit('update:modelValue', false)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  position: relative;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 20px;
  animation: slideDown 0.3s ease-out;
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 36px;
  height: 36px;
  border: none;
  background: var(--glass-bg);
  color: var(--text-primary);
  font-size: 20px;
  border-radius: 50%;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.modal-close:hover {
  background: var(--glass-hover);
  transform: rotate(90deg);
}

.modal-header {
  padding-bottom: 20px;
  border-bottom: 1px solid var(--glass-border);
  margin-bottom: 24px;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.modal-body {
  color: var(--text-secondary);
  line-height: 1.6;
}

.modal-footer {
  padding-top: 20px;
  border-top: 1px solid var(--glass-border);
  margin-top: 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(-20px);
}

@keyframes slideDown {
  from {
    transform: scale(0.9) translateY(-20px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
</style>
