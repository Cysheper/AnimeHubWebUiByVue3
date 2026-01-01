<template>
  <GlassCard class="post-card" clickable @click="handleClick">
    <div class="post-header">
      <div class="author-info">
        <img 
          :src="post.author.avatar" 
          :alt="post.author.username" 
          class="author-avatar clickable" 
          @click.stop="goToUserProfile"
        />
        <div class="author-details">
          <span class="author-name clickable" @click.stop="goToUserProfile">{{ post.author.username }}</span>
          <span class="post-time">{{ formatTime(post.createdAt) }}</span>
        </div>
      </div>
    </div>

    <div class="post-content">
      <h3 class="post-title">{{ post.title }}</h3>
      <p class="post-text">{{ truncateText(post.content, 200) }}</p>
      <div v-if="post.images && post.images.length > 0" class="post-images">
        <img
          v-for="(image, index) in post.images.slice(0, 3)"
          :key="index"
          :src="image"
          :alt="`图片 ${index + 1}`"
          class="post-image"
        />
      </div>
    </div>

    <div class="post-footer">
      <button class="action-btn" :class="{ liked: post.isLiked }" @click.stop="handleLike">
        <span class="action-icon"><i :class="post.isLiked ? 'fas fa-heart' : 'far fa-heart'"></i></span>
        <span class="action-count">{{ post.likes }}</span>
      </button>
      <button class="action-btn">
        <span class="action-icon"><i class="far fa-comment"></i></span>
        <span class="action-count">{{ post.commentCount }}</span>
      </button>
      <button class="action-btn">
        <span class="action-icon"><i class="far fa-eye"></i></span>
        <span class="action-count">{{ post.viewCount }}</span>
      </button>
      <button 
        v-if="isOwnPost" 
        class="action-btn edit-btn" 
        @click.stop="handleEdit"
      >
        <span class="action-icon"><i class="fas fa-edit"></i></span>
        <span class="action-text">编辑</span>
      </button>
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import GlassCard from './GlassCard.vue'
import type { Post } from '@/types'

interface Props {
  post: Post
}

const props = defineProps<Props>()
const router = useRouter()
const userStore = useUserStore()

const emit = defineEmits<{
  like: [postId: number]
  click: []
}>()

// 判断是否是自己的帖子
const isOwnPost = computed(() => {
  if (!userStore.user) return false
  return props.post.author.id === userStore.user.id
})

const handleLike = () => {
  emit('like', props.post.id)
}

const handleClick = () => {
  emit('click')
}

// 跳转到用户主页
const goToUserProfile = () => {
  router.push(`/user/${props.post.author.id}`)
}

// 编辑帖子
const handleEdit = () => {
  router.push(`/edit-post/${props.post.id}`)
}

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<style scoped>
.post-card {
  transition: var(--transition);
  cursor: pointer;
}

.post-header {
  margin-bottom: 16px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--glass-border);
}

.author-avatar.clickable {
  cursor: pointer;
  transition: transform 0.3s;
}

.author-avatar.clickable:hover {
  transform: scale(1.1);
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.author-name.clickable {
  cursor: pointer;
  transition: color 0.3s;
}

.author-name.clickable:hover {
  color: var(--primary-color);
}

.post-time {
  font-size: 12px;
  color: var(--text-muted);
}

.post-content {
  margin-bottom: 16px;
}

.post-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
  line-height: 1.4;
}

.post-text {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.post-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  transition: var(--transition);
}

.post-image:hover {
  transform: scale(1.02);
}

.post-footer {
  display: flex;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--glass-border);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: var(--glass-button);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.action-btn:hover {
  /* background: rgba(255, 255, 255, 0.1); 不改变颜色/透明度 */
  transform: translateY(-2px);
}

.action-btn.liked {
  color: var(--text-primary);
  background: var(--glass-button);
}

.action-icon {
  font-size: 18px;
}

.action-count {
  font-size: 14px;
  font-weight: 600;
}

.action-text {
  font-size: 14px;
  font-weight: 500;
}

.edit-btn {
  margin-left: auto;
}

.edit-btn:hover {
  color: rgba(red, green, blue, alpha);
}
</style>
