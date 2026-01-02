<template>
  <div class="post-detail-page">
    <div class="layout-grid">
      <section class="content">
        <GlassButton variant="outline" @click="goBack" class="back-btn">
          <i class="fas fa-arrow-left"></i> 返回
        </GlassButton>

        <div v-if="loading" class="loading">
          <div class="loader"></div>
        </div>

        <GlassCard v-else-if="post" class="post-detail">
          <div class="post-header">
            <div class="author-info">
              <img 
                :src="post.author.avatar" 
                :alt="post.author.username" 
                class="author-avatar clickable" 
                @click="goToUserProfile(post.author.id)"
              />
              <div class="author-details">
                <span class="author-name clickable" @click="goToUserProfile(post.author.id)">{{ post.author.username }}</span>
                <span class="post-time">{{ formatTime(post.createdAt) }}</span>
              </div>
            </div>
          </div>

          <div class="post-content">
            <h1 class="post-title">{{ post.title }}</h1>
            <div class="post-text" v-html="renderedContent"></div>
            <div v-if="post.images && post.images.length > 0" class="post-images">
              <img
                v-for="(image, index) in post.images"
                :key="index"
                :src="image"
                :alt="`图片 ${index + 1}`"
                class="post-image"
              />
            </div>
          </div>

          <div class="post-actions">
            <button class="action-btn" :class="{ liked: post.isLiked }" @click="handleLike">
              <span class="action-icon"><i :class="post.isLiked ? 'fas fa-heart' : 'far fa-heart'"></i></span>
              <span class="action-text">{{ post.isLiked ? '已点赞' : '点赞' }}</span>
              <span class="action-count">{{ post.likes }}</span>
            </button>
            <button class="action-btn">
              <span class="action-icon"><i class="far fa-eye"></i></span>
              <span class="action-text">浏览</span>
              <span class="action-count">{{ post.viewCount }}</span>
            </button>
            <button 
              v-if="isOwnPost" 
              class="action-btn edit-btn" 
              @click="handleEdit"
            >
              <span class="action-icon"><i class="fas fa-edit"></i></span>
              <span class="action-text">编辑</span>
            </button>
          </div>

          <div class="comments-section">
            <h3 class="comments-title">
              评论 <span class="comment-count">({{ post.commentCount }})</span>
            </h3>

            <div v-if="isLoggedIn" class="comment-form">
              <GlassInput
                v-model="newComment"
                type="textarea"
                placeholder="写下你的评论..."
                :rows="3"
              />
              <GlassButton
                variant="primary"
                :loading="commenting"
                @click="handleComment"
                class="comment-btn"
              >
                发表评论
              </GlassButton>
            </div>
            <div v-else class="login-prompt">
              <p>请先<a href="/login" class="login-link">登录</a>后再评论</p>
            </div>

            <div class="comments-list">
              <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
                <img
                  :src="comment.author.avatar"
                  :alt="comment.author.username"
                  class="comment-avatar clickable"
                  @click="goToUserProfile(comment.author.id)"
                />
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author clickable" @click="goToUserProfile(comment.author.id)">{{ comment.author.username }}</span>
                    <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                    <!-- 三点菜单（仅作者可见） -->
                    <div v-if="isOwnComment(comment.author.id)" class="comment-menu-wrapper">
                      <button class="comment-menu-btn" @click.stop="toggleCommentMenu(comment.id)">
                        <i class="fas fa-ellipsis-h"></i>
                      </button>
                      <div v-if="activeCommentMenu === comment.id" class="comment-dropdown">
                        <button class="dropdown-item delete" @click.stop="handleDeleteComment(comment.id)">
                          <i class="fas fa-trash"></i> 删除
                        </button>
                      </div>
                    </div>
                  </div>
                  <p class="comment-text">{{ comment.content }}</p>
                  <div class="comment-actions">
                    <button
                      class="comment-like-btn"
                      :class="{ liked: comment.isLiked }"
                      @click="handleLikeComment(comment.id)"
                    >
                      <span><i :class="comment.isLiked ? 'fas fa-heart' : 'far fa-heart'"></i></span>
                      <span>{{ comment.likes }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      <aside class="sidebar">
        <AuthorCard v-if="post && authorInfo" :author="authorInfo" @follow="handleAuthorFollow" />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostStore } from '@/stores/post'
import { useUserStore } from '@/stores/user'
import { deleteComment } from '@/api/posts'
import { containsForbiddenWords } from '@/utils/forbidden'
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import katex from 'katex'
import hljs from 'highlight.js'
import GlassCard from '@/components/GlassCard.vue'
import GlassButton from '@/components/GlassButton.vue'
import GlassInput from '@/components/GlassInput.vue'
import AuthorCard from '@/components/AuthorCard.vue'

type AuthorInfo = {
  id: number
  username: string
  avatar: string
  signature?: string
  postsCount?: number
  likesCount?: number
  followersCount?: number
  createdAt: string
}

const route = useRoute()
const router = useRouter()
const postStore = usePostStore()
const userStore = useUserStore()

const loading = ref(false)
const commenting = ref(false)
const newComment = ref('')
const post = computed(() => postStore.currentPost)
const isLoggedIn = computed(() => userStore.isLoggedIn)
const authorInfo = ref<AuthorInfo | null>(null)
const activeCommentMenu = ref<number | null>(null)

// 配置 marked（Markdown 渲染）
const md = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
      return hljs.highlight(code, { language }).value
    }
  })
)

md.setOptions({
  breaks: true,
  gfm: true
})

// 渲染 Markdown 和 LaTeX
const renderedContent = computed(() => {
  if (!post.value?.content) return ''
  
  let content = post.value.content
  
  // 处理块级 LaTeX 公式 $$...$$
  content = content.replace(/\$\$([\s\S]+?)\$\$/g, (_match, formula) => {
    try {
      return '<div class="latex-block">' + katex.renderToString(formula.trim(), {
        displayMode: true,
        throwOnError: false
      }) + '</div>'
    } catch (e) {
      return '<div class="latex-error">LaTeX 渲染错误</div>'
    }
  })
  
  // 处理行内 LaTeX 公式 $...$
  content = content.replace(/\$([^\$\n]+?)\$/g, (_match, formula) => {
    try {
      return '<span class="latex-inline">' + katex.renderToString(formula, {
        displayMode: false,
        throwOnError: false
      }) + '</span>'
    } catch (e) {
      return '<span class="latex-error">LaTeX 错误</span>'
    }
  })
  
  // 渲染 Markdown
  return md.parse(content) as string
})

const fetchAuthorInfo = async () => {
  if (!post.value) {
    authorInfo.value = null
    return
  }

  try {
    const response = await fetch(`/api/users/${post.value.author.id}/profile`)

    if (response.ok) {
      const result = await response.json()

      const profile = result.data
      profile.followersCount = profile.followersList?.length || 0
      profile.followingCount = profile.followingList?.length || 0
      profile.postsCount = profile.postsCount ?? 0
      profile.likesCount = profile.likesCount ?? 0

      authorInfo.value = {
        id: post.value.author.id,
        username: post.value.author.username,
        avatar: post.value.author.avatar,
        signature: profile.signature || '',
        postsCount: profile.postsCount || 0,
        likesCount: profile.likesCount || 0,
        followersCount: profile.followersCount || 0,
        createdAt: profile.createdAt,
      }
    } else {
      authorInfo.value = {
        id: post.value.author.id,
        username: post.value.author.username,
        avatar: post.value.author.avatar,
        signature: post.value.author.signature || '',
        postsCount: post.value.author.postsCount || 0,
        likesCount: post.value.author.likesCount || 0,
        followersCount: post.value.author.followersCount || 0,
        createdAt: post.value.author.createdAt
      }
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
    authorInfo.value = null
  }
}

// 判断是否是自己的帖子
const isOwnPost = computed(() => {
  if (!post.value || !userStore.user) return false
  return post.value.author.id === userStore.user.id
})

const goBack = () => {
  router.back()
}

// 跳转到用户主页
const goToUserProfile = (userId: number) => {
  router.push(`/user/${userId}`)
}

// 编辑帖子
const handleEdit = () => {
  if (post.value) {
    router.push(`/post/${post.value.id}/edit`)
  }
}

// 判断是否是自己的评论
const isOwnComment = (authorId: number) => {
  return userStore.user?.id === authorId
}

// 切换评论菜单
const toggleCommentMenu = (commentId: number) => {
  if (activeCommentMenu.value === commentId) {
    activeCommentMenu.value = null
  } else {
    activeCommentMenu.value = commentId
  }
}

// 点击其他地方关闭菜单
const handleClickOutside = () => {
  activeCommentMenu.value = null
}

// 删除评论
const handleDeleteComment = async (commentId: number) => {
  if (!confirm('确定要删除这条评论吗？')) return
  
  try {
    await deleteComment(commentId)
    // 重新加载帖子以刷新评论列表
    if (post.value) {
      await postStore.fetchPostById(post.value.id)
    }
    activeCommentMenu.value = null
  } catch (error) {
    alert('删除失败，请稍后重试')
  }
}

// 关注作者（从 store 处理）
const handleAuthorFollow = (isFollowing: boolean) => {
  console.log('关注状态变更:', isFollowing)
}

const handleLike = async () => {
  if (!post.value) return
  await postStore.likePost(post.value.id)
}

const handleComment = async () => {
  if (!post.value || !newComment.value.trim()) return

  // 违禁词检查
  if (containsForbiddenWords(newComment.value)) {
    alert('含有违规内容，发表失败')
    return
  }

  commenting.value = true
  try {
    await postStore.createComment(post.value.id, newComment.value)
    newComment.value = ''
  } catch (error) {
    alert('评论失败，请稍后重试')
  } finally {
    commenting.value = false
  }
}

const handleLikeComment = async (commentId: number) => {
  await postStore.likeComment(commentId)
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

watch(
  () => post.value?.author?.id,
  async () => {
    await fetchAuthorInfo()
  },
  { immediate: true }
)

onMounted(async () => {
  const postId = Number(route.params.id)
  if (!postId) {
    router.push('/')
    return
  }

  loading.value = true
  try {
    await postStore.fetchPostById(postId)
  } catch (error) {
    alert('帖子不存在')
    router.push('/')
  } finally {
    loading.value = false
  }
  
  // 添加点击外部关闭菜单
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.post-detail-page {
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeIn 0.6s ease-out;
}

.layout-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  align-items: start;
}

.content {
  min-height: 400px;
}

.sidebar {
  position: sticky;
  top: 100px;
  animation: slideInRight 0.6s ease-out;
}

.back-btn {
  margin-bottom: 20px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
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

.post-detail {
  padding: 32px;
}

.post-header {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--glass-border);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.author-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--glass-border);
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.author-name.clickable,
.comment-author.clickable {
  cursor: pointer;
  transition: color 0.3s;
}

.author-name.clickable:hover,
.comment-author.clickable:hover {
  color: var(--primary-color);
}

.author-avatar.clickable,
.comment-avatar.clickable {
  cursor: pointer;
  transition: transform 0.3s;
}

.author-avatar.clickable:hover,
.comment-avatar.clickable:hover {
  transform: scale(1.1);
}

.post-time {
  font-size: 14px;
  color: var(--text-muted);
}

.post-content {
  margin-bottom: 24px;
}

.post-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 20px;
  line-height: 1.4;
}

.post-text {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 20px;
}

/* Markdown 渲染样式 */
.post-text :deep(h1) {
  font-size: 28px;
  font-weight: 800;
  margin: 28px 0 14px;
  color: var(--text-primary);
}

.post-text :deep(h2) {
  font-size: 24px;
  font-weight: 700;
  margin: 24px 0 12px;
  color: var(--text-primary);
}

.post-text :deep(h3) {
  font-size: 20px;
  font-weight: 600;
  margin: 20px 0 10px;
  color: var(--text-primary);
}

.post-text :deep(p) {
  margin: 16px 0;
  color: var(--text-primary);
}

.post-text :deep(code) {
  padding: 2px 8px;
  background: var(--glass-stat);
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  color: var(--text-primary);
}

.post-text :deep(pre) {
  margin: 16px 0;
  padding: 16px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  overflow-x: auto;
}

.post-text :deep(pre code) {
  padding: 0;
  background: transparent;
  border-radius: 0;
}

.post-text :deep(blockquote) {
  margin: 16px 0;
  padding-left: 16px;
  border-left: 4px solid var(--glass-border);
  color: var(--text-secondary);
}

.post-text :deep(ul), .post-text :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
}

.post-text :deep(li) {
  margin: 8px 0;
}

.post-text :deep(img) {
  max-width: 100%;
  border-radius: 12px;
  margin: 16px 0;
}

.post-text :deep(a) {
  color: var(--primary-color);
  text-decoration: underline;
}

.post-text :deep(.latex-block) {
  margin: 24px 0;
  padding: 16px;
  background: var(--glass-subtle);
  border-radius: 12px;
  overflow-x: auto;
  text-align: center;
}

.post-text :deep(.latex-inline) {
  display: inline-block;
  margin: 0 4px;
}

.post-text :deep(.latex-error) {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
}

.post-text :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

.post-text :deep(th), .post-text :deep(td) {
  padding: 10px 12px;
  border: 1px solid var(--glass-border);
  text-align: left;
}

.post-text :deep(th) {
  background: var(--glass-subtle);
  font-weight: 600;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.post-image {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  transition: var(--transition);
  cursor: pointer;
}

/* .post-image:hover: 不改变缩放，是文章内容 */

.post-actions {
  display: flex;
  gap: 16px;
  padding: 20px 0;
  border-top: 1px solid var(--glass-border);
  border-bottom: 1px solid var(--glass-border);
  margin-bottom: 32px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  transition: var(--transition);
}

.action-btn:hover {
  /* background: rgba(255, 255, 255, 0.1); 按钮不改变颜色/透明度 */
  transform: translateY(-2px);
}

.action-btn.liked {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.2);
}

.action-btn.edit-btn:hover {
  color: black;
}

.action-icon {
  font-size: 24px;
}

.action-text {
  font-weight: 600;
}

.action-count {
  font-weight: 700;
}

.comments-section {
  padding-top: 32px;
}

.comments-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.comment-count {
  color: var(--text-muted);
  font-weight: 400;
}

.comment-form {
  margin-bottom: 32px;
}

.comment-btn {
  margin-top: 12px;
}

.login-prompt {
  text-align: center;
  padding: 32px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 32px;
}

.login-prompt p {
  color: var(--text-secondary);
  font-size: 16px;
}

.login-link {
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 600;
}

.login-link:hover {
  text-decoration: underline;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: var(--transition);
}

/* .comment-item:hover: 不改变颜色/透明度 */

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--glass-border);
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.comment-author {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.comment-time {
  font-size: 13px;
  color: var(--text-muted);
}

.comment-text {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
  white-space: pre-wrap;
}

.comment-actions {
  display: flex;
  gap: 12px;
}

.comment-like-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: var(--transition);
}

/* .comment-like-btn:hover: 按钮不改变颜色/透明度 */

.comment-like-btn.liked {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.15);
}

/* 评论菜单样式 */
.comment-menu-wrapper {
  position: relative;
  margin-left: auto;
}

.comment-menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 50%;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.comment-menu-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.comment-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  min-width: 100px;
  z-index: 100;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: var(--transition);
  text-align: left;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.dropdown-item.delete {
  color: #ff6b6b;
}

.dropdown-item.delete:hover {
  background: rgba(255, 107, 107, 0.1);
}

@media (max-width: 1024px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .post-detail {
    padding: 20px;
  }

  .post-title {
    font-size: 24px;
  }

  .post-text {
    font-size: 15px;
  }
}
</style>
