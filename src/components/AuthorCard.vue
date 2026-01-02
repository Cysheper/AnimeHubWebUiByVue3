<template>
  <GlassCard class="author-card">
    <div class="author-header">
      <div class="author-avatar-wrapper" @click="goToProfile">
        <img :src="author.avatar" :alt="author.username" class="author-avatar" />
      </div>
      <h3 class="author-name" @click="goToProfile">{{ author.username }}</h3>
      <p class="author-signature">{{ author.signature || '这个人很懒，什么都没写...' }}</p>
    </div>

    <div class="author-stats">
      <div class="stat-item">
        <span class="stat-value">{{ author.postsCount || 0 }}</span>
        <span class="stat-label">帖子</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ author.likesCount || 0 }}</span>
        <span class="stat-label">获赞</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ author.followersCount || 0 }}</span>
        <span class="stat-label">粉丝</span>
      </div>
    </div>

    <div class="author-meta">
      <span class="meta-item">
        <i class="far fa-calendar-alt"></i>
        加入于 {{ formatDate(author.createdAt) }}
      </span>
    </div>

    <div class="author-actions">
      <GlassButton
        v-if="!isOwnProfile"
        :variant="isFollowing ? 'outline' : 'primary'"
        :class="{ 'followed-btn': isFollowing }"
        @click="handleFollow"
        :loading="followLoading"
        class="follow-btn"
      >
        <i :class="isFollowing ? 'fas fa-check' : 'fas fa-plus'"></i>
        {{ isFollowing ? '已关注' : '关注' }}
      </GlassButton>
      <GlassButton variant="outline" @click="goToProfile" class="profile-btn">
        <i class="fas fa-user"></i> 进入主页
      </GlassButton>
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import GlassCard from '@/components/GlassCard.vue'
import GlassButton from '@/components/GlassButton.vue'

interface AuthorInfo {
  id: number
  username: string
  avatar: string
  signature?: string
  postsCount?: number
  likesCount?: number
  followersCount?: number
  createdAt: string
}

const props = defineProps<{
  author: AuthorInfo
}>()

const emit = defineEmits<{
  (e: 'follow', isFollowing: boolean): void
}>()

const router = useRouter()
const userStore = useUserStore()
const followLoading = ref(false)
// 从 store 的关注列表判断是否已关注

const isFollowing = computed(() => {
  return userStore.isFollowing(props.author.id)
})

const isOwnProfile = computed(() => {
  return userStore.user?.id === props.author.id
})

const formatDate = (dateString: string) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const goToProfile = () => {
  router.push(`/user/${props.author.id}`)
}

const handleFollow = async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  followLoading.value = true
  try {
    const success = await userStore.toggleFollow(props.author.id)
    if (success) {
      emit('follow', isFollowing.value)
    }
  } catch (error) {
    console.error('关注操作失败:', error)
  } finally {
    followLoading.value = false
  }
};

</script>

<style scoped>
.author-card {
  padding: 24px;
  text-align: center;
}

.author-header {
  margin-bottom: 20px;
}

.author-avatar-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto 12px;
  cursor: pointer;
  transition: transform 0.3s;
}

.author-avatar-wrapper:hover {
  transform: scale(1.05);
}

.author-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--glass-border);
}

.author-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  cursor: pointer;
  transition: color 0.3s;
}

.author-name:hover {
  color: var(--primary-color);
}

.author-signature {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.author-stats {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 16px 0;
  margin: 16px 0;
  border-top: 1px solid var(--glass-border);
  border-bottom: 1px solid var(--glass-border);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.author-meta {
  margin-bottom: 16px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
}

.meta-item i {
  color: var(--primary-color);
}

.author-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.follow-btn {
  width: 100%;
}

.followed-btn {
  background: var(--glass-bg) !important;
  color: var(--text-secondary) !important;
  border-color: var(--glass-border) !important;
}

.followed-btn:hover {
  background: rgba(var(--primary-rgb), 0.1) !important;
}

.profile-btn {
  width: 100%;
}
</style>
