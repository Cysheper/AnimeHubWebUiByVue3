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
      <div class="post-body" :class="{ 'has-image': firstImageUrl }">
        <!-- 显示内容中的第一张图片 -->
        <img 
          v-if="firstImageUrl" 
          :src="firstImageUrl" 
          alt="帖子图片" 
          class="content-image"
        />
        <div class="post-text" v-html="renderedContent"></div>
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
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import katex from 'katex'
import hljs from 'highlight.js'
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

// 配置 marked
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

// 从内容中提取第一张图片链接
const firstImageUrl = computed(() => {
  const content = props.post.content
  // 匹配 Markdown 图片语法 ![alt](url) 或直接的图片链接
  const mdImageMatch = content.match(/!\[.*?\]\((.*?)\)/)
  if (mdImageMatch) return mdImageMatch[1]
  
  // 匹配常见图片链接
  const urlMatch = content.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)/i)
  if (urlMatch) return urlMatch[0]
  
  // 如果 post.images 有内容，返回第一张
  if (props.post.images && props.post.images.length > 0) {
    return props.post.images[0]
  }
  
  return null
})

// 渲染 Markdown 和 LaTeX（截断版本）
const renderedContent = computed(() => {
  let content = props.post.content
  
  // 移除图片语法，避免重复显示
  content = content.replace(/!\[.*?\]\(.*?\)/g, '')
  
  // 截断内容
  if (content.length > 200) {
    content = content.substring(0, 200) + '...'
  }
  
  // 处理块级 LaTeX 公式 $$...$$
  content = content.replace(/\$\$([\s\S]+?)\$\$/g, (_match, formula) => {
    try {
      return '<div class="latex-block">' + katex.renderToString(formula.trim(), {
        displayMode: true,
        throwOnError: false
      }) + '</div>'
    } catch {
      return '<span class="latex-error">LaTeX 错误</span>'
    }
  })
  
  // 处理行内 LaTeX 公式 $...$
  content = content.replace(/\$([^\$\n]+?)\$/g, (_match, formula) => {
    try {
      return '<span class="latex-inline">' + katex.renderToString(formula, {
        displayMode: false,
        throwOnError: false
      }) + '</span>'
    } catch {
      return '<span class="latex-error">LaTeX 错误</span>'
    }
  })
  
  // 渲染 Markdown
  return md.parse(content) as string
})

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
  router.push(`/post/${props.post.id}/edit`)
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

.post-body {
  display: block;
}

.post-body.has-image {
  display: flex;
  gap: 16px;
}

.content-image {
  width: 160px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  flex-shrink: 0;
}

.post-body.has-image .post-text {
  flex: 1;
  min-width: 0;
  max-height: 120px;
  overflow: hidden;
}

.post-text {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.post-text :deep(p) {
  margin: 0 0 8px 0;
}

.post-text :deep(h1),
.post-text :deep(h2),
.post-text :deep(h3) {
  font-size: 16px;
  margin: 8px 0;
  color: var(--text-primary);
}

.post-text :deep(code) {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}

.post-text :deep(pre) {
  background: rgba(0, 0, 0, 0.3);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
}

.post-text :deep(.latex-block),
.post-text :deep(.latex-inline) {
  overflow-x: auto;
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
