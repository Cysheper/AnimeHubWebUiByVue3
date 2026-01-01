<template>
  <button class="glass-button" :class="[variant, { loading, disabled }]" :disabled="disabled || loading">
    <span v-if="loading" class="loader"></span>
    <span v-else class="button-content">
      <slot></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline'
  loading?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  loading: false,
  disabled: false
})
</script>

<style scoped>
.glass-button {
  position: relative;
  padding: 12px 32px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  background: var(--glass-button);
  /* backdrop-filter: blur(10px); 已关闭，太卡 */
  /* -webkit-backdrop-filter: blur(10px); 已关闭，太卡 */
  border: 1px solid var(--glass-border);
  cursor: pointer;
  transition: var(--transition);
  overflow: hidden;
}

.glass-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

/* .glass-button:hover::before, :hover, :active: 已去掉悬停动效 */

.glass-button.primary {
  background: var(--glass-button);
  border: 1px solid var(--glass-border);
}

/* .glass-button.primary:hover: 不改变颜色/透明度 */

.glass-button.secondary {
  background: var(--glass-button);
  border: 1px solid var(--glass-border);
  opacity: 0.9;
}

/* .glass-button.secondary:hover: 不改变颜色/透明度 */

.glass-button.outline {
  background: transparent;
  border: 2px solid var(--glass-border);
}

.glass-button.disabled,
.glass-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.glass-button.loading {
  cursor: wait;
}

.button-content {
  position: relative;
  z-index: 1;
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: var(--text-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
  position: relative;
  z-index: 1;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
