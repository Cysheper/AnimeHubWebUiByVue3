<template>
  <div class="admin-page">
    <!-- 权限检查中 -->
    <div v-if="checkingAuth" class="auth-loading">
      <div class="loader"></div>
      <p>正在验证权限...</p>
    </div>

    <!-- 已授权，显示管理内容 -->
    <div v-else-if="isAuthorized" class="admin-container">
      <!-- 管理员头部 -->
      <GlassCard class="admin-header">
        <div class="header-content">
          <div class="header-left">
            <i class="fas fa-shield-alt admin-icon"></i>
            <div>
              <h1 class="admin-title">管理员控制台</h1>
              <p class="admin-subtitle">管理帖子和评论内容</p>
            </div>
          </div>
          <div class="header-stats">
            <div class="stat-box">
              <span class="stat-value">{{ totalPosts }}</span>
              <span class="stat-label">总帖子</span>
            </div>
            <div class="stat-box">
              <span class="stat-value">{{ totalComments }}</span>
              <span class="stat-label">总评论</span>
            </div>
            <div class="stat-box">
              <span class="stat-value">{{ totalUsers }}</span>
              <span class="stat-label">总用户</span>
            </div>
          </div>
        </div>
      </GlassCard>

      <!-- 筛选和搜索 -->
      <GlassCard class="filter-section">
        <div class="filters">
          <div class="filter-group">
            <label class="filter-label">
              <i class="fas fa-filter"></i> 内容类型
            </label>
            <select v-model="contentType" class="filter-select">
              <option value="posts">帖子</option>
              <option value="comments">评论</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">
              <i class="fas fa-sort"></i> 排序方式
            </label>
            <select v-model="sortBy" class="filter-select">
              <option value="latest">最新发布</option>
              <option value="oldest">最早发布</option>
              <option value="mostLiked">最多点赞</option>
              <option value="mostCommented">最多评论</option>
            </select>
          </div>

          <div class="filter-group search-group">
            <label class="filter-label">
              <i class="fas fa-search"></i> 搜索
            </label>
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="搜索标题、内容或用户..."
            />
          </div>

          <GlassButton variant="outline" @click="resetFilters">
            <i class="fas fa-redo"></i> 重置
          </GlassButton>
        </div>
      </GlassCard>

      <!-- 内容列表 -->
      <div class="content-section">
        <div v-if="loading" class="loading">
          <div class="loader"></div>
        </div>

        <!-- 帖子列表 -->
        <div v-else-if="contentType === 'posts'" class="posts-list">
          <GlassCard
            v-for="post in filteredPosts"
            :key="post.id"
            class="admin-post-card"
          >
            <div class="post-header">
              <div class="author-info">
                <img :src="post.author.avatar" :alt="post.author.username" class="author-avatar" />
                <div class="author-details">
                  <span class="author-name">{{ post.author.username }}</span>
                  <span class="post-time">{{ formatTime(post.createdAt) }}</span>
                </div>
              </div>
              <div class="post-actions">
                <GlassButton variant="outline" size="small" @click="viewPost(post.id)">
                  <i class="far fa-eye"></i> 查看
                </GlassButton>
                <GlassButton variant="outline" size="small" @click="confirmDeletePost(post)">
                  <i class="fas fa-trash-alt"></i> 删除
                </GlassButton>
              </div>
            </div>

            <div class="post-content">
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-text">{{ truncateText(post.content, 150) }}</p>
            </div>

            <div class="post-footer">
              <span class="post-stat">
                <i class="fas fa-heart"></i> {{ post.likes }}
              </span>
              <span class="post-stat">
                <i class="far fa-comment"></i> {{ post.commentCount }}
              </span>
              <span class="post-stat">
                <i class="far fa-eye"></i> {{ post.viewCount }}
              </span>
            </div>

            <!-- 展开显示评论 -->
            <div v-if="expandedPosts.includes(post.id)" class="comments-section">
              <div class="comments-header">
                <h4 class="comments-title">
                  <i class="far fa-comments"></i> 评论 ({{ post.comments.length }})
                </h4>
                <button class="collapse-btn" @click="collapsePost(post.id)">
                  <i class="fas fa-chevron-up"></i>
                </button>
              </div>
              <div class="comments-list">
                <div
                  v-for="comment in post.comments"
                  :key="comment.id"
                  class="comment-item"
                >
                  <div class="comment-header">
                    <div class="comment-author">
                      <img :src="comment.author.avatar" :alt="comment.author.username" class="comment-avatar" />
                      <span class="comment-author-name">{{ comment.author.username }}</span>
                      <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                    </div>
                    <button class="delete-comment-btn" @click="confirmDeleteComment(comment, post)">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <p class="comment-content">{{ comment.content }}</p>
                </div>
              </div>
            </div>
            <button v-else class="expand-btn" @click="expandPost(post.id)">
              <i class="fas fa-chevron-down"></i> 查看评论 ({{ post.comments.length }})
            </button>
          </GlassCard>

          <div v-if="filteredPosts.length === 0" class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>没有找到帖子</p>
          </div>
        </div>

        <!-- 评论列表 -->
        <div v-else class="comments-list-view">
          <GlassCard
            v-for="comment in filteredComments"
            :key="comment.id"
            class="admin-comment-card"
          >
            <div class="comment-header-full">
              <div class="comment-author">
                <img :src="comment.author.avatar" :alt="comment.author.username" class="comment-avatar" />
                <div class="comment-author-info">
                  <span class="comment-author-name">{{ comment.author.username }}</span>
                  <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                </div>
              </div>
              <GlassButton variant="outline" size="small" @click="confirmDeleteComment(comment)">
                <i class="fas fa-trash-alt"></i> 删除
              </GlassButton>
            </div>
            <p class="comment-content-full">{{ comment.content }}</p>
            <div class="comment-post-ref">
              <i class="fas fa-link"></i>
              来自帖子: <span class="post-link" @click="viewPost(comment.postId)">{{ getPostTitle(comment.postId) }}</span>
            </div>
          </GlassCard>

          <div v-if="filteredComments.length === 0" class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>没有找到评论</p>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <GlassCard class="pagination" v-if="totalPages > 1">
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </GlassCard>
    </div>
    <!-- isAuthorized 区块结束 -->

    <!-- 删除确认模态框 -->
    <GlassModal v-model="showDeleteModal" title="确认删除">
      <div class="delete-confirm">
        <i class="fas fa-exclamation-triangle warning-icon"></i>
        <h3>{{ deleteType === 'post' ? '删除帖子' : '删除评论' }}</h3>
        <p v-if="deleteType === 'post' && deleteTarget">
          确定要删除帖子 "<strong>{{ (deleteTarget as Post).title }}</strong>" 吗？
        </p>
        <p v-else>
          确定要删除此评论吗？
        </p>
        <p class="warning-text">此操作不可撤销！</p>
      </div>
      <template #footer>
        <GlassButton variant="outline" @click="showDeleteModal = false" :disabled="deleteLoading">
          取消
        </GlassButton>
        <GlassButton variant="primary" @click="executeDelete" class="delete-confirm-btn" :disabled="deleteLoading">
          <i class="fas fa-trash-alt"></i> {{ deleteLoading ? '删除中...' : '确认删除' }}
        </GlassButton>
      </template>
    </GlassModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import GlassCard from '@/components/GlassCard.vue'
import GlassButton from '@/components/GlassButton.vue'
import GlassModal from '@/components/GlassModal.vue'
import type { Post, Comment } from '@/types'
import { 
  getAdminStats, 
  getAdminPosts, 
  getAdminComments, 
  deletePost as apiDeletePost, 
  deleteComment as apiDeleteComment,
  type AdminStats 
} from '@/api/admin'

const router = useRouter()
const userStore = useUserStore()

// 权限检查状态
const isAuthorized = ref(false)
const checkingAuth = ref(true)

// 加载状态
const loading = ref(false)
const statsLoading = ref(false)
const deleteLoading = ref(false)

// 筛选相关
const contentType = ref<'posts' | 'comments'>('posts')
const sortBy = ref<'latest' | 'oldest' | 'mostLiked' | 'mostCommented'>('latest')
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 20
const expandedPosts = ref<number[]>([])

// 删除相关
const showDeleteModal = ref(false)
const deleteType = ref<'post' | 'comment'>('post')
const deleteTarget = ref<Post | Comment | null>(null)
const deleteParentPost = ref<Post | null>(null)

// 数据
const allPosts = ref<Post[]>([])
const allComments = ref<Comment[]>([])

// 统计数据
const stats = ref<AdminStats>({
  totalPosts: 0,
  totalComments: 0,
  totalUsers: 0
})

// 分页总数
const totalPostsCount = ref(0)
const totalCommentsCount = ref(0)

// 统计数据 computed（从API获取的数据）
const totalPosts = computed(() => stats.value.totalPosts)
const totalComments = computed(() => stats.value.totalComments)
const totalUsers = computed(() => stats.value.totalUsers)

// 筛选后的帖子 - 数据已从API分页获取，这里仅展示当前页数据
const filteredPosts = computed(() => {
  return allPosts.value
})

// 筛选后的评论 - 数据已从API分页获取，这里仅展示当前页数据
const filteredComments = computed(() => {
  return allComments.value
})

// 总页数
const totalPages = computed(() => {
  const total = contentType.value === 'posts' ? totalPostsCount.value : totalCommentsCount.value
  return Math.max(1, Math.ceil(total / pageSize))
})

// 格式化时间
const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN')
}

// 截断文本
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 获取帖子标题
const getPostTitle = (postId: number) => {
  const post = allPosts.value.find(p => p.id === postId)
  return post ? post.title : '未知帖子'
}

// 展开/收起帖子评论
const expandPost = (postId: number) => {
  if (!expandedPosts.value.includes(postId)) {
    expandedPosts.value.push(postId)
  }
}

const collapsePost = (postId: number) => {
  expandedPosts.value = expandedPosts.value.filter(id => id !== postId)
}

// 查看帖子
const viewPost = (postId: number) => {
  router.push(`/post/${postId}`)
}

// 重置筛选
const resetFilters = () => {
  searchQuery.value = ''
  sortBy.value = 'latest'
  currentPage.value = 1
  loadData()
}

// 切换页码
const changePage = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
  loadData()
}

// 确认删除帖子
const confirmDeletePost = (post: Post) => {
  deleteType.value = 'post'
  deleteTarget.value = post
  showDeleteModal.value = true
}

// 确认删除评论
const confirmDeleteComment = (comment: Comment, parentPost?: Post) => {
  deleteType.value = 'comment'
  deleteTarget.value = comment
  deleteParentPost.value = parentPost || null
  showDeleteModal.value = true
}

// 执行删除
const executeDelete = async () => {
  if (!deleteTarget.value) return
  
  deleteLoading.value = true
  try {
    if (deleteType.value === 'post') {
      // 删除帖子 - 调用API
      const postId = deleteTarget.value.id
      await apiDeletePost(postId)
      
      // 从本地列表中移除
      allPosts.value = allPosts.value.filter(p => p.id !== postId)
      totalPostsCount.value = Math.max(0, totalPostsCount.value - 1)
      
      // 更新统计数据
      stats.value.totalPosts = Math.max(0, stats.value.totalPosts - 1)
      
      alert('帖子删除成功')
    } else {
      // 删除评论 - 调用API
      const commentId = deleteTarget.value.id
      await apiDeleteComment(commentId)
      
      // 从所有评论列表中删除
      allComments.value = allComments.value.filter(c => c.id !== commentId)
      totalCommentsCount.value = Math.max(0, totalCommentsCount.value - 1)
      
      // 从帖子的评论列表中删除
      if (deleteParentPost.value) {
        const post = allPosts.value.find(p => p.id === deleteParentPost.value!.id)
        if (post) {
          post.comments = post.comments.filter(c => c.id !== commentId)
          post.commentCount = post.comments.length
        }
      } else {
        // 从所有帖子中查找并删除
        allPosts.value.forEach(post => {
          post.comments = post.comments.filter(c => c.id !== commentId)
          post.commentCount = post.comments.length
        })
      }
      
      // 更新统计数据
      stats.value.totalComments = Math.max(0, stats.value.totalComments - 1)
      
      alert('评论删除成功')
    }
    
    showDeleteModal.value = false
    deleteTarget.value = null
    deleteParentPost.value = null
  } catch (error) {
    console.error('删除失败:', error)
    alert('删除失败，请重试')
  } finally {
    deleteLoading.value = false
  }
}

// 加载统计数据
const loadStats = async () => {
  statsLoading.value = true
  try {
    const result = await getAdminStats()
    stats.value = result
  } catch (error) {
    console.error('获取统计数据失败:', error)
  } finally {
    statsLoading.value = false
  }
}

// 加载帖子数据
const loadPosts = async () => {
  loading.value = true
  try {
    const sortByValue = sortBy.value === 'mostLiked' || sortBy.value === 'mostCommented' 
      ? sortBy.value 
      : sortBy.value as 'latest' | 'oldest'
    
    const result = await getAdminPosts({
      page: currentPage.value,
      pageSize,
      sortBy: sortByValue,
      search: searchQuery.value || undefined
    })
    
    allPosts.value = result.items
    totalPostsCount.value = result.total
  } catch (error) {
    console.error('获取帖子列表失败:', error)
    allPosts.value = []
  } finally {
    loading.value = false
  }
}

// 加载评论数据
const loadComments = async () => {
  loading.value = true
  try {
    const sortByValue = sortBy.value === 'latest' || sortBy.value === 'oldest' 
      ? sortBy.value 
      : 'latest'
    
    const result = await getAdminComments({
      page: currentPage.value,
      pageSize,
      sortBy: sortByValue,
      search: searchQuery.value || undefined
    })
    
    allComments.value = result.items
    totalCommentsCount.value = result.total
  } catch (error) {
    console.error('获取评论列表失败:', error)
    allComments.value = []
  } finally {
    loading.value = false
  }
}

// 加载数据（根据当前内容类型）
const loadData = async () => {
  if (contentType.value === 'posts') {
    await loadPosts()
  } else {
    await loadComments()
  }
}

// 监听内容类型变化，重新加载数据
watch(contentType, () => {
  currentPage.value = 1
  loadData()
})

// 监听排序变化，重新加载数据
watch(sortBy, () => {
  currentPage.value = 1
  loadData()
})

// 监听搜索变化，使用防抖
let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadData()
  }, 300)
})

onMounted(async () => {
  // 先获取用户信息
  checkingAuth.value = true
  try {
    const userData = await userStore.fetchUserInfo()
    
    console.log('用户信息:', userData)
    console.log('isAdmin 值:', userData?.isAdmin)
    console.log('isAdmin 类型:', typeof userData?.isAdmin)
    console.log('!userData?.isAdmin:', !userData?.isAdmin)
    
    // 检查管理员权限 - 兼容字符串 "true" 和布尔值 true
    const isAdmin = userData?.isAdmin === true || String(userData?.isAdmin) === 'true'
    
    if (!isAdmin) {
      alert('您没有权限访问此页面')
      router.push('/')
      return
    }
    
    isAuthorized.value = true
    
    // 加载管理员数据
    loadStats()
    loadData()
  } catch (error) {
    console.error('获取用户信息失败:', error)
    alert('请先登录')
    router.push('/login')
  } finally {
    checkingAuth.value = false
  }
})
</script>

<style scoped>
.admin-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

/* 权限验证加载 */
.auth-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  gap: 20px;
  color: var(--text-secondary);
}

.auth-loading p {
  font-size: 16px;
}

.admin-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 管理员头部 */
.admin-header {
  background: linear-gradient(135deg, rgba(255, 59, 48, 0.1) 0%, rgba(255, 149, 0, 0.1) 100%);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-icon {
  font-size: 48px;
  color: #ff3b30;
}

.admin-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.admin-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 4px 0 0 0;
}

.header-stats {
  display: flex;
  gap: 24px;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 20px;
  background: var(--glass-subtle);
  border-radius: 12px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

/* 筛选区域 */
.filters {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-select,
.search-input {
  padding: 10px 14px;
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  background: var(--glass-subtle);
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.3s;
}

.filter-select:focus,
.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  background: var(--glass-bg);
}

.search-group {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
}

/* 内容列表 */
.content-section {
  min-height: 400px;
}

.posts-list,
.comments-list-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 帖子卡片 */
.admin-post-card {
  transition: transform 0.3s;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--glass-border);
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
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-weight: 600;
  color: var(--text-primary);
}

.post-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.post-actions {
  display: flex;
  gap: 8px;
}

.post-content {
  margin-bottom: 16px;
}

.post-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.post-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.post-footer {
  display: flex;
  gap: 20px;
  padding-top: 12px;
  border-top: 1px solid var(--glass-border);
}

.post-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
}

/* 评论区域 */
.expand-btn {
  width: 100%;
  padding: 10px;
  margin-top: 12px;
  background: var(--glass-subtle);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.expand-btn:hover {
  background: var(--glass-bg);
  border-color: var(--primary-color);
}

.comments-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px solid var(--glass-border);
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.comments-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.collapse-btn {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s;
}

.collapse-btn:hover {
  background: var(--glass-subtle);
  color: var(--text-primary);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-item {
  padding: 12px;
  background: var(--glass-subtle);
  border-radius: 8px;
  border: 1px solid var(--glass-border);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-author-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
}

.comment-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.delete-comment-btn {
  padding: 4px 8px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

.delete-comment-btn:hover {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
}

.comment-content {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* 评论列表视图 */
.admin-comment-card {
  padding: 16px;
}

.comment-header-full {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.comment-author-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.comment-content-full {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 12px;
}

.comment-post-ref {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  padding-top: 12px;
  border-top: 1px solid var(--glass-border);
}

.post-link {
  color: var(--primary-color);
  cursor: pointer;
  text-decoration: underline;
}

.post-link:hover {
  opacity: 0.8;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 16px;
}

.page-btn {
  padding: 8px 16px;
  background: var(--glass-subtle);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  background: var(--glass-bg);
  border-color: var(--primary-color);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: var(--text-primary);
}

/* 删除确认模态框 */
.delete-confirm {
  text-align: center;
  padding: 20px;
}

.warning-icon {
  font-size: 64px;
  color: #ff3b30;
  margin-bottom: 16px;
}

.delete-confirm h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.delete-confirm p {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  line-height: 1.6;
}

.warning-text {
  color: #ff3b30 !important;
  font-weight: 600;
  margin-top: 16px !important;
}

.delete-confirm-btn {
  background: #ff3b30 !important;
  border-color: #ff3b30 !important;
}

.delete-confirm-btn:hover {
  opacity: 0.8;
}

/* 空状态 */
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
  font-size: 16px;
}

/* 加载动画 */
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

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-page {
    padding: 12px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-stats {
    width: 100%;
    justify-content: space-around;
  }

  .filters {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }

  .post-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .post-actions {
    width: 100%;
  }
}
</style>
