<template>
  <div class="glass-card" :class="{ hoverable, clickable }" @click="handleClick">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  hoverable?: boolean
  clickable?: boolean
}

withDefaults(defineProps<Props>(), {
  hoverable: true,
  clickable: false
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
.glass-card {
  background: var(--glass-bg);
  /* backdrop-filter: blur(10px); 已关闭，太卡 */
  /* -webkit-backdrop-filter: blur(10px); 已关闭，太卡 */
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow);
  transition: var(--transition);
}

/* .glass-card.hoverable:hover: 不改变颜色/透明度 */

.glass-card.clickable {
  cursor: pointer;
}

/* .glass-card.clickable:active: 已去掉悬停动效 */
</style>
