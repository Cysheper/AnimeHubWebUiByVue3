<template>
  <div class="glass-input-wrapper" :class="{ focused, error }">
    <label v-if="label" class="input-label">{{ label }}</label>
    <div class="input-container">
      <span v-if="icon" class="input-icon"><i :class="icon"></i></span>
      <input
        v-if="type !== 'textarea'"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :autocomplete="autocomplete"
        @input="handleInput"
        @focus="focused = true"
        @blur="focused = false"
        class="glass-input"
      />
      <textarea
        v-else
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :rows="rows"
        @input="handleInput"
        @focus="focused = true"
        @blur="focused = false"
        class="glass-input"
      ></textarea>
    </div>
    <span v-if="errorMessage" class="error-message">{{ errorMessage }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue: string
  type?: string
  label?: string
  placeholder?: string
  icon?: string
  disabled?: boolean
  error?: boolean
  errorMessage?: string
  rows?: number
  autocomplete?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  error: false,
  rows: 4,
  autocomplete: 'off'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const focused = ref(false)

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
.glass-input-wrapper {
  width: 100%;
  margin-bottom: 20px;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  font-size: 20px;
  color: var(--text-muted);
  pointer-events: none;
  z-index: 1;
}

.glass-input {
  width: 100%;
  padding: 14px 16px;
  font-size: 16px;
  color: var(--text-primary);
  background: var(--glass-bg);
  /* backdrop-filter: blur(10px); 已关闭，太卡 */
  /* -webkit-backdrop-filter: blur(10px); 已关闭，太卡 */
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  transition: var(--transition);
  outline: none;
}

.input-container .input-icon + .glass-input {
  padding-left: 48px;
}

.glass-input::placeholder {
  color: var(--text-muted);
}

.glass-input:focus {
  background: var(--glass-hover);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.glass-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.glass-input-wrapper.focused .input-icon {
  color: var(--text-primary);
}

.glass-input-wrapper.error .glass-input {
  border-color: #ff6b6b;
}

.glass-input-wrapper.error .input-icon {
  color: #ff6b6b;
}

.error-message {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #ff6b6b;
}

textarea.glass-input {
  resize: vertical;
  min-height: 100px;
}
</style>
