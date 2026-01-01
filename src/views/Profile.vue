<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- 个人信息卡片 -->
      <GlassCard class="profile-header">
        <div class="profile-cover">
          <div class="cover-gradient"></div>
        </div>
        <div class="profile-main">
          <div class="avatar-section">
            <div class="avatar-wrapper" @click="triggerAvatarUpload">
              <img :src="userProfile.avatar" :alt="userProfile.username" class="profile-avatar" />
              <div class="avatar-overlay">
                <i class="fas fa-camera"></i>
                <span>更换头像</span>
              </div>
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                @change="handleAvatarChange"
                style="display: none"
              />
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
              <span class="meta-item" color="black">
                <i class="far fa-calendar-alt"></i>
                加入于 {{ formatDate(userProfile.createdAt) }}
              </span>
              <span class="meta-item" v-if="userProfile.email">
                <i class="far fa-envelope"></i>
                {{ userProfile.email }}
              </span>
              <span class="meta-item" v-if="userProfile.id">
                <i class="far fa-envelope"></i>
                UID: {{ userProfile.id }}
              </span>
            </div>
            <div class="profile-actions">
              <GlassButton variant="primary" @click="showEditModal = true">
                <i class="fas fa-edit"></i> 编辑资料
              </GlassButton>
              <GlassButton variant="outline" @click="handleLogout">
                <i class="fas fa-sign-out-alt"></i> 退出登录
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
        <!-- 我的帖子 -->
        <div v-if="activeTab === 'posts'" class="posts-section">
          <div v-if="loadingPosts" class="loading">
            <div class="loader"></div>
          </div>
          <div v-else-if="userPosts.length === 0" class="empty-state">
            <i class="far fa-file-alt"></i>
            <p>还没有发布任何帖子</p>
            <GlassButton variant="primary" @click="goToCreatePost">
              <i class="fas fa-pen"></i> 发布第一篇帖子
            </GlassButton>
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

        <!-- 收藏的帖子 -->
        <div v-else-if="activeTab === 'favorites'" class="posts-section">
          <div v-if="loadingFavorites" class="loading">
            <div class="loader"></div>
          </div>
          <div v-else-if="favoritePosts.length === 0" class="empty-state">
            <i class="far fa-bookmark"></i>
            <p>还没有收藏任何帖子</p>
          </div>
          <div v-else class="posts-list">
            <PostCard
              v-for="post in favoritePosts"
              :key="post.id"
              :post="post"
              @like="handleLike"
              @click="goToPost(post.id)"
            />
          </div>
        </div>

        <!-- 设置 -->
        <div v-else-if="activeTab === 'settings'" class="settings-section">
          <GlassCard class="settings-card">
            <h3 class="settings-title"><i class="fas fa-cog"></i> 账号设置</h3>
            <div class="settings-content">
              <div class="setting-item">
                <label class="setting-label">邮箱通知</label>
                <label class="switch">
                  <input type="checkbox" v-model="settings.emailNotifications" />
                  <span class="slider"></span>
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label">私信通知</label>
                <label class="switch">
                  <input type="checkbox" v-model="settings.messageNotifications" />
                  <span class="slider"></span>
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label">公开个人资料</label>
                <label class="switch">
                  <input type="checkbox" v-model="settings.publicProfile" />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            <div class="settings-actions">
              <GlassButton variant="primary" @click="saveSettings">
                <i class="fas fa-save"></i> 保存设置
              </GlassButton>
            </div>
          </GlassCard>

          <GlassCard class="settings-card danger-zone">
            <h3 class="settings-title"><i class="fas fa-exclamation-triangle"></i> 危险操作</h3>
            <div class="settings-content">
              <GlassButton variant="outline" @click="handleDeleteAccount" class="danger-btn">
                <i class="fas fa-trash-alt"></i> 删除账号
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>

    <!-- 编辑资料模态框 -->
    <GlassModal v-model="showEditModal" title="编辑个人资料">
      <div class="edit-form">
        <GlassInput
          v-model="editForm.username"
          label="昵称"
          placeholder="请输入昵称"
          icon="fas fa-user"
        />
        <GlassInput
          v-model="editForm.email"
          type="email"
          label="邮箱"
          placeholder="请输入邮箱"
          icon="fas fa-envelope"
        />
        <GlassInput
          v-model="editForm.signature"
          type="textarea"
          label="个性签名"
          placeholder="介绍一下自己吧..."
          :rows="3"
        />
        <div class="form-group">
          <label class="form-label">更改密码（可选）</label>
          <GlassInput
            v-model="editForm.currentPassword"
            type="password"
            placeholder="当前密码"
            icon="fas fa-lock"
          />
          <GlassInput
            v-model="editForm.newPassword"
            type="password"
            placeholder="新密码"
            icon="fas fa-lock"
          />
          <GlassInput
            v-model="editForm.confirmPassword"
            type="password"
            placeholder="确认新密码"
            icon="fas fa-lock"
          />
        </div>
      </div>
      <template #footer>
        <GlassButton variant="outline" @click="showEditModal = false">
          取消
        </GlassButton>
        <GlassButton variant="primary" :loading="submitting" @click="handleUpdateProfile">
          保存
        </GlassButton>
      </template>
    </GlassModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePostStore } from '@/stores/post'
import GlassCard from '@/components/GlassCard.vue'
import GlassButton from '@/components/GlassButton.vue'
import GlassInput from '@/components/GlassInput.vue'
import GlassModal from '@/components/GlassModal.vue'
import PostCard from '@/components/PostCard.vue'
import type { Post } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const postStore = usePostStore()

const avatarInput = ref<HTMLInputElement>()
const showEditModal = ref(false)
const submitting = ref(false)
const loadingPosts = ref(false)
const loadingFavorites = ref(false)

const activeTab = ref('posts')
const tabs = [
  { key: 'posts', label: '我的帖子', icon: 'fas fa-file-alt' },
  { key: 'favorites', label: '收藏', icon: 'far fa-bookmark' },
  { key: 'settings', label: '设置', icon: 'fas fa-cog' }
]

// 用户资料
const userProfile = ref({
  id: userStore.user?.id || 0,
  username: userStore.user?.username || '',
  email: userStore.user?.email || '',
  avatar: userStore.user?.avatar || '',
  signature: userStore.user?.signature || '',
  postsCount: userStore.user?.postsCount || 0,
  likesCount: userStore.user?.likesCount || 0,
  followersCount: userStore.user?.followersCount || 0,
  followingCount: userStore.user?.followingCount || 0,
  createdAt: userStore.user?.createdAt || new Date().toISOString()
})

// 编辑表单
const editForm = ref({
  username: userProfile.value.username,
  email: userProfile.value.email,
  signature: userProfile.value.signature,
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 设置
const settings = ref({
  emailNotifications: true,
  messageNotifications: true,
  publicProfile: true
})

// 保存设置
const saveSettings = async () => {
  try {
    const response = await fetch('/api/users/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      },
      body: JSON.stringify(settings.value)
    })
    
    if (!response.ok) throw new Error('保存失败')
    
    alert('设置保存成功！')
  } catch (error) {
    console.error('保存设置失败:', error)
    alert('保存设置失败，请重试')
  }
}

// 用户发布的帖子
const userPosts = ref<Post[]>([])
const favoritePosts = ref<Post[]>([])

// 触发头像上传
const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

// 处理头像更改
const handleAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const formData = new FormData()
    formData.append('avatar', file)
    
    try {
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userStore.token}`
        },
        body: formData
      })
      
      if (!response.ok) throw new Error('上传失败')
      
      const data = await response.json()
      userProfile.value.avatar = data.data.avatarUrl
      
      // 更新 store 中的用户信息
      if (userStore.user) {
        userStore.user.avatar = data.data.avatarUrl
      }
      
      alert('头像上传成功！')
    } catch (error) {
      console.error('头像上传失败:', error)
      alert('头像上传失败，请重试')
    }
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

// 更新个人资料
const handleUpdateProfile = async () => {
  if (!editForm.value.username.trim()) {
    alert('昵称不能为空')
    return
  }

  if (editForm.value.newPassword) {
    if (!editForm.value.currentPassword) {
      alert('请输入当前密码')
      return
    }
    if (editForm.value.newPassword !== editForm.value.confirmPassword) {
      alert('两次输入的新密码不一致')
      return
    }
    if (editForm.value.newPassword.length < 6) {
      alert('新密码长度至少为6位')
      return
    }
  }

  submitting.value = true
  try {
    // 更新基本资料
    const updateData: any = {
      username: editForm.value.username,
      email: editForm.value.email,
      signature: editForm.value.signature
    }
    
    const response = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      },
      body: JSON.stringify(updateData)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || '更新失败')
    }
    
    const data = await response.json()
    
    // 更新本地数据
    userProfile.value.username = data.data.username
    userProfile.value.email = data.data.email
    userProfile.value.signature = data.data.signature
    
    // 更新 store
    if (userStore.user) {
      userStore.user.username = data.data.username
      userStore.user.email = data.data.email
      userStore.user.signature = data.data.signature
    }
    
    // 如果要更改密码，单独调用密码接口
    if (editForm.value.newPassword) {
      const passwordResponse = await fetch('/api/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userStore.token}`
        },
        body: JSON.stringify({
          currentPassword: editForm.value.currentPassword,
          newPassword: editForm.value.newPassword
        })
      })
      
      if (!passwordResponse.ok) {
        const error = await passwordResponse.json()
        throw new Error(error.message || '密码修改失败')
      }
    }
    
    // 清空密码字段
    editForm.value.currentPassword = ''
    editForm.value.newPassword = ''
    editForm.value.confirmPassword = ''
    
    showEditModal.value = false
    alert('个人资料更新成功！')
  } catch (error: any) {
    alert(error.message || '更新失败，请重试')
  } finally {
    submitting.value = false
  }
}// 退出登录
const handleLogout = async () => {
  if (confirm('确定要退出登录吗？')) {
    await userStore.logout()
    router.push('/login')
  }
}

// 删除账号
const handleDeleteAccount = async () => {
  if (confirm('警告：删除账号后所有数据将无法恢复！确定要继续吗？')) {
    if (confirm('请再次确认删除账号')) {
      const password = prompt('请输入密码确认删除:')
      if (!password) return
      
      try {
        const response = await fetch('/api/users/account', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userStore.token}`
          },
          body: JSON.stringify({ password })
        })
        
        if (!response.ok) throw new Error('删除失败')
        
        await userStore.logout()
        router.push('/login')
        alert('账号已删除')
      } catch (error) {
        console.error('删除账号失败:', error)
        alert('删除账号失败，请重试')
      }
    }
  }
}

// 点赞帖子
const handleLike = async (postId: number) => {
  await postStore.likePost(postId)
  // 重新加载帖子列表
  if (activeTab.value === 'posts') {
    await loadUserPosts()
  } else if (activeTab.value === 'favorites') {
    await loadFavoritePosts()
  }
}

// 跳转到帖子详情
const goToPost = (postId: number) => {
  router.push(`/post/${postId}`)
}

// 跳转到创建帖子
const goToCreatePost = () => {
  router.push('/create-post')
}

// 加载用户发布的帖子
const loadUserPosts = async () => {
  loadingPosts.value = true
  try {
    const response = await fetch(`/api/users/${userProfile.value.id}/posts`, {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    if (!response.ok) throw new Error('加载失败')
    
    const result = await response.json()
    const data = result.data
    userPosts.value = data.items
    
    // 更新统计数据
    if (data.total !== undefined) {
      userProfile.value.postsCount = data.total
    }
  } catch (error) {
    console.error('加载用户帖子失败:', error)
    userPosts.value = []
  } finally {
    loadingPosts.value = false
  }
}

// 加载收藏的帖子
const loadFavoritePosts = async () => {
  loadingFavorites.value = true
  try {
    const response = await fetch('/api/users/favorites', {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    if (!response.ok) throw new Error('加载失败')
    
    const result = await response.json()
    favoritePosts.value = result.data.items
  } catch (error) {
    console.error('加载收藏失败:', error)
    favoritePosts.value = []
  } finally {
    loadingFavorites.value = false
  }
}

onMounted(async () => {
  // 等待用户 store 初始化（如果未登录则跳转）
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  
  // 加载用户完整信息 - 使用 token 获取当前用户信息，不需要传 ID
  try {
    const response = await fetch('/api/auth/user', {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    if (response.ok) {
      const result = await response.json()
      const user = result.data
      
      userProfile.value = {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        signature: user.signature || '',
        postsCount: user.postsCount || 0,
        likesCount: user.likesCount || 0,
        followersCount: user.followersCount || 0,
        followingCount: user.followingCount || 0,
        createdAt: user.createdAt
      }
      
      // 更新编辑表单
      editForm.value.username = user.username
      editForm.value.email = user.email
      editForm.value.signature = user.signature || ''
      
      // 用户信息加载成功后，才加载帖子
      await loadUserPosts()
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
  
  // 加载用户设置
  try {
    const response = await fetch('/api/users/settings', {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    if (response.ok) {
      const result = await response.json()
      settings.value = result.data
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
})
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.profile-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 个人信息头部 */
.profile-header {
  overflow: hidden;
  padding: 0 !important;
}

.profile-cover {
  height: 200px;
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
  margin-top: -80px;
  position: relative;
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.avatar-wrapper {
  position: relative;
  cursor: pointer;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 5px solid var(--glass-bg);
  overflow: hidden;
  transition: transform 0.3s;
}

.avatar-wrapper:hover {
  transform: scale(1.05);
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
  color: white;
  font-size: 14px;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay i {
  font-size: 24px;
}

.profile-info {
  text-align: center;
}

.profile-name {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.profile-signature {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.profile-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 20px;
  padding: 20px 0;
  border-top: 1px solid var(--glass-border);
  border-bottom: 1px solid var(--glass-border);
}

.profile-stats .stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.profile-meta {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.meta-item i {
  color: var(--primary-color);
}

.profile-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* 标签页 */
.profile-tabs {
  padding: 0 !important;
}

.tabs-header {
  display: flex;
  gap: 0;
}

.tab-item {
  flex: 1;
  padding: 16px 24px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  font-size: 16px;
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
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  background: rgba(var(--primary-rgb), 0.1);
}

/* 内容区域 */
.profile-content {
  min-height: 400px;
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
  padding: 80px 20px;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 18px;
  margin-bottom: 24px;
}

/* 设置区域 */
.settings-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-card {
  padding: 24px;
}

.settings-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--glass-border);
  display: flex;
  justify-content: flex-end;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--glass-border);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 16px;
  color: var(--text-primary);
}

/* 开关按钮 */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: var(--glass-border);
  transition: 0.4s;
  border-radius: 26px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.danger-zone {
  border: 2px solid rgba(255, 59, 48, 0.3);
}

.danger-zone .settings-title {
  color: #ff3b30;
}

.danger-btn {
  color: #ff3b30 !important;
  border-color: #ff3b30 !important;
}

.danger-btn:hover {
  background: rgba(255, 59, 48, 0.1) !important;
}

/* 编辑表单 */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

/* 加载动画 */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-page {
    padding: 12px;
  }

  .profile-main {
    padding: 0 20px 20px;
  }

  .profile-name {
    font-size: 24px;
  }

  .profile-stats {
    gap: 20px;
  }

  .stat-value {
    font-size: 20px;
  }

  .profile-actions {
    flex-direction: column;
  }

  .profile-actions button {
    width: 100%;
  }

  .tabs-header {
    overflow-x: auto;
  }

  .tab-item {
    font-size: 14px;
    padding: 12px 16px;
    white-space: nowrap;
  }
}
</style>
