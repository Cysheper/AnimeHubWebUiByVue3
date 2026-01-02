<template>
  <div class="user-profile-page">
    <div class="profile-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        <div class="loader"></div>
      </div>

      <!-- 用户不存在 -->
      <GlassCard v-else-if="!userProfile" class="not-found">
        <i class="fas fa-user-slash"></i>
        <h2>用户不存在</h2>
        <p>该用户可能已被删除或不存在</p>
        <GlassButton variant="primary" @click="goBack">返回</GlassButton>
      </GlassCard>

      <template v-else>
        <!-- 个人信息卡片 -->
        <GlassCard class="profile-header">
          <div class="profile-cover">
            <div class="cover-gradient"></div>
          </div>
          <div class="profile-main">
            <div class="avatar-section">
              <div class="avatar-wrapper">
                <img :src="userProfile.avatar" :alt="userProfile.username" class="profile-avatar" />
              </div>
            </div>
            <div class="profile-info">
              <h1 class="profile-name">{{ userProfile.username }}</h1>
              <p class="profile-signature">{{ userProfile.signature || '这个人很懒，什么都没写...' }}</p>
              <div class="profile-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ userProfile.postsCount }}</span>
                  <span class="stat-label">帖子</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ userProfile.likesCount }}</span>
                  <span class="stat-label">获赞</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ userProfile.followersCount }}</span>
                  <span class="stat-label">粉丝</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ userProfile.followingCount }}</span>
                  <span class="stat-label">关注</span>
                </div>
              </div>
              <div class="profile-meta">
                <span class="meta-item">
                  <i class="fa-chisel fa-regular fa-calendar"></i>
                  加入于 {{ formatDate(userProfile.createdAt) }}   
                </span>
                
                <span class="meta-item">
                  <i class="fa-solid fa-id-badge"></i>
                  UID: {{ userProfile.id }}
                </span>
              </div>
              <div class="profile-actions" v-if="!isOwnProfile">
                <GlassButton
                  :variant="isFollowing ? 'outline' : 'primary'"
                  :class="{ 'followed-btn': isFollowing }"
                  @click="handleFollow"
                  :loading="followLoading"
                >
                  <i :class="isFollowing ? 'fas fa-check' : 'fas fa-plus'"></i>
                  {{ isFollowing ? '已关注' : '关注' }}
                </GlassButton>
              </div>
              <div class="profile-actions" v-else>
                <GlassButton variant="primary" @click="goToMyProfile">
                  <i class="fas fa-edit"></i> 编辑资料
                </GlassButton>
              </div>
            </div>
          </div>
        </GlassCard>

        <!-- 标签页 -->
        <GlassCard class="profile-tabs">
          <div class="tabs-header">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              :class="['tab-item', { active: activeTab === tab.key }]"
              @click="activeTab = tab.key"
            >
              <i :class="tab.icon"></i>
              {{ tab.label }}
            </button>
          </div>
        </GlassCard>

        <!-- 内容区域 -->
        <div class="profile-content">
          <!-- 帖子列表 -->
          <div v-if="activeTab === 'posts'" class="posts-section">
            <div v-if="loadingPosts" class="loading">
              <div class="loader"></div>
            </div>
            <div v-else-if="userPosts.length === 0" class="empty-state">
              <i class="far fa-file-alt"></i>
              <p>还没有发布任何帖子</p>
            </div>
            <div v-else class="posts-list">
              <PostCard
                v-for="post in userPosts"
                :key="post.id"
                :post="post"
                @like="handleLike"
                @click="goToPost(post.id)"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePostStore } from '@/stores/post'
import GlassCard from '@/components/GlassCard.vue'
import GlassButton from '@/components/GlassButton.vue'
import PostCard from '@/components/PostCard.vue'
import type { Post } from '@/types'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const postStore = usePostStore()

const loading = ref(true)
const loadingPosts = ref(false)
const followLoading = ref(false)
const activeTab = ref('posts')

const tabs = [
  { key: 'posts', label: '帖子', icon: 'fas fa-file-alt' }
]

// 用户资料
const userProfile = ref<{
  id: number
  username: string
  email: string
  avatar: string
  signature?: string
  postsCount?: number
  likesCount?: number
  followersCount?: number 
  followingCount?: number 
  isAdmin?: boolean
  followingList?: number[] // 关注的用户ID列表
  followersList?: number[] // 粉丝的用户ID列表
  createdAt: string
} | null>(null)

const userPosts = ref<Post[]>([])

// 从 store 的关注列表判断是否已关注
const isFollowing = computed(() => {
  if (!userProfile.value) return false
  return userStore.isFollowing(userProfile.value.id)
})

// 是否是自己的主页
const isOwnProfile = computed(() => {
  return userStore.user?.id === userProfile.value?.id
})

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

// 返回
const goBack = () => {
  router.back()
}

// 跳转到自己的主页编辑
const goToMyProfile = () => {
  router.push('/profile')
}

// 跳转到帖子详情
const goToPost = (postId: number) => {
  router.push(`/post/${postId}`)
}

// 点赞帖子
const handleLike = async (postId: number) => {
  await postStore.likePost(postId)
  await loadUserPosts()
}

// 关注/取消关注
const handleFollow = async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }

  if (!userProfile.value) return

  followLoading.value = true
  try {
    const wasFollowing = isFollowing.value
    const success = await userStore.toggleFollow(userProfile.value.id)
    // const ok = await userStore.addFollowing(userProfile.value.id)

    if (success && userProfile.value) {
      // 更新粉丝数
      userProfile.value.followersCount = (userProfile.value.followersCount ?? 0) + (wasFollowing ? -1 : 1)
    }
  } catch (error) {
    console.error('关注操作失败:', error)
  } finally {
    followLoading.value = false
  }
}

// 加载用户信息
const loadUserProfile = async (userId: number) => {
  loading.value = true
  try {
    const response = await fetch(`/api/users/${userId}/profile`, {
      headers: userStore.token ? {
        'Authorization': `Bearer ${userStore.token}`
      } : {}
    })

    if (response.ok) {
      const result = await response.json()

      const profile = result.data
      profile.followersCount = profile.followersList?.length || 0
      profile.followingCount = profile.followingList?.length || 0
      profile.postsCount = profile.postsCount ?? 0
      profile.likesCount = profile.likesCount ?? 0
      userProfile.value = profile
      
    } else {
      userProfile.value = null
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
    userProfile.value = null
  } finally {
    loading.value = false
  }
}

// 加载用户帖子
const loadUserPosts = async () => {
  if (!userProfile.value) return

  loadingPosts.value = true
  try {
    const response = await fetch(`/api/users/${userProfile.value.id}/posts`, {
      headers: userStore.token ? {
        'Authorization': `Bearer ${userStore.token}`
      } : {}
    })

    if (response.ok) {
      const result = await response.json()
      userPosts.value = result.data.items || []
    }
  } catch (error) {
    console.error('加载用户帖子失败:', error)
    userPosts.value = []
  } finally {
    loadingPosts.value = false
  }
}

// 监听路由变化
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      const userId = Number(newId)
      
      // 如果是自己，跳转到 /profile
      if (userStore.user?.id === userId) {
        router.replace('/profile')
        return
      }
      
      await loadUserProfile(userId)
      if (userProfile.value) {
        await loadUserPosts()
      }
    }
  },
  { immediate: true }
)

onMounted(async () => {
  const userId = Number(route.params.id)
  
  if (!userId) {
    router.push('/')
    return
  }

  // 如果是自己，跳转到 /profile
  if (userStore.user?.id === userId) {
    router.replace('/profile')
    return
  }
  
})
</script>

<style scoped>
.user-profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.profile-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 加载状态 */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loader {
  width: 50px;
  height: 50px;
  border: 4px solid var(--glass-border);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 用户不存在 */
.not-found {
  text-align: center;
  padding: 60px 20px;
}

.not-found i {
  font-size: 64px;
  color: var(--text-muted);
  margin-bottom: 20px;
}

.not-found h2 {
  font-size: 24px;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.not-found p {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

/* 个人信息头部 */
.profile-header {
  overflow: hidden;
  padding: 0 !important;
}

.profile-cover {
  height: 180px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.cover-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
}

.profile-main {
  padding: 0 30px 30px;
  margin-top: -60px;
  position: relative;
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.avatar-wrapper {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 4px solid var(--glass-bg);
  overflow: hidden;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info {
  text-align: center;
}

.profile-name {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.profile-signature {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.profile-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 16px;
  padding: 16px 0;
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
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.profile-meta {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  gap: 24px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(22, 20, 22);
}

.meta-item i {
  color: rgba(22, 20, 22, 0.8);
}

.profile-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.followed-btn {
  background: var(--glass-bg) !important;
  color: var(--text-secondary) !important;
  border-color: var(--glass-border) !important;
}

/* 标签页 */
.profile-tabs {
  padding: 0 !important;
}

.tabs-header {
  display: flex;
}

.tab-item {
  flex: 1;
  padding: 14px 20px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab-item:hover {
  color: var(--text-primary);
  background: rgba(var(--primary-rgb), 0.05);
}

.tab-item.active {
  color: rgba(22, 20, 22, 0.9);
  border-bottom-color: var(--primary-color);
  background: rgba(var(--primary-rgb), 0.1);
}

/* 内容区域 */
.profile-content {
  min-height: 300px;
}

.posts-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-profile-page {
    padding: 12px;
  }

  .profile-main {
    padding: 0 20px 20px;
  }

  .profile-name {
    font-size: 20px;
  }

  .profile-stats {
    gap: 20px;
  }

  .stat-value {
    font-size: 18px;
  }
}
</style>
