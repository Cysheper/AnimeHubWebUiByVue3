<template>
  <div class="create-post-page">
    <div class="page-container">
      <div class="editor-section">
        <GlassCard>
          <div class="page-header">
            <h1 class="page-title"><i class="fas fa-pen"></i> 发布新帖子</h1>
            <p class="page-description">支持 Markdown 和 LaTeX 公式</p>
          </div>

          <div class="form-group">
            <label class="form-label">标题</label>
            <GlassInput
              v-model="post.title"
              placeholder="给你的帖子起个标题吧..."
            />
          </div>

          <div class="form-group">
            <label class="form-label">分类</label>
            <select v-model="post.category" class="category-select">
              <option value="">选择分类</option>
              <option value="discussion">讨论</option>
              <option value="question">提问</option>
              <option value="share">分享</option>
              <option value="tutorial">教程</option>
              <option value="news">资讯</option>
            </select>
          </div>

          <div class="form-group">
            <div class="editor-header">
              <label class="form-label">内容</label>
              <div class="editor-tools">
                <button @click="insertMarkdown('**粗体**')" class="tool-btn" title="粗体">
                  <i class="fas fa-bold"></i>
                </button>
                <button @click="insertMarkdown('*斜体*')" class="tool-btn" title="斜体">
                  <i class="fas fa-italic"></i>
                </button>
                <button @click="insertMarkdown('# ')" class="tool-btn" title="标题">
                  <i class="fas fa-heading"></i>
                </button>
                <button @click="insertMarkdown('`代码`')" class="tool-btn" title="行内代码">
                  <i class="fas fa-code"></i>
                </button>
                <button @click="insertMarkdown('\n```\n代码块\n```\n')" class="tool-btn" title="代码块">
                  <i class="fas fa-file-code"></i>
                </button>
                <button @click="insertMarkdown('$$公式$$')" class="tool-btn" title="LaTeX 公式">
                  <i class="fas fa-square-root-alt"></i>
                </button>
                <button @click="insertMarkdown('[链接](url)')" class="tool-btn" title="链接">
                  <i class="fas fa-link"></i>
                </button>
                <button @click="insertMarkdown('![图片](url)')" class="tool-btn" title="图片">
                  <i class="fas fa-image"></i>
                </button>
              </div>
            </div>
            <textarea
              ref="contentInput"
              v-model="post.content"
              class="content-editor"
              placeholder="支持 Markdown 语法和 LaTeX 公式...

Markdown 示例：
**粗体** *斜体* ~~删除线~~
# 一级标题
## 二级标题
- 列表项
1. 有序列表

LaTeX 公式示例：
行内公式：$E = mc^2$
块级公式：
$$
\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$

代码块：
```javascript
console.log('Hello World');
```
"
              rows="20"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">标签（可选）</label>
            <div class="tags-input">
              <span
                v-for="(tag, index) in post.tags"
                :key="index"
                class="tag-item"
              >
                {{ tag }}
                <button @click="removeTag(index)" class="tag-remove"><i class="fas fa-times"></i></button>
              </span>
              <input
                v-model="newTag"
                @keydown.enter.prevent="addTag"
                @keydown.space.prevent="addTag"
                class="tag-input"
                placeholder="输入标签后按空格或回车"
              />
            </div>
          </div>

          <div class="form-actions">
            <GlassButton variant="outline" @click="goBack">
              取消
            </GlassButton>
            <GlassButton variant="primary" @click="togglePreview">
              {{ showPreview ? '编辑' : '预览' }}
            </GlassButton>
            <GlassButton variant="primary" @click="submitPost" :loading="submitting">
              发布
            </GlassButton>
          </div>
        </GlassCard>
      </div>

      <div v-if="showPreview" class="preview-section">
        <GlassCard>
          <div class="preview-header">
            <h2 class="preview-title">预览</h2>
          </div>
          <div class="preview-content">
            <h1 class="post-title">{{ post.title || '标题预览' }}</h1>
            <div class="post-meta">
              <span v-if="post.category" class="post-category">{{ getCategoryName(post.category) }}</span>
              <span v-if="post.tags.length" class="post-tags">
                <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
              </span>
            </div>
            <div class="post-body" v-html="renderedContent"></div>
          </div>
        </GlassCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import katex from 'katex'
import hljs from 'highlight.js'
import GlassCard from '@/components/GlassCard.vue'
import GlassButton from '@/components/GlassButton.vue'
import GlassInput from '@/components/GlassInput.vue'
import { createPost } from '@/api/posts'

const router = useRouter()

const post = ref({
  title: '',
  content: '',
  category: '',
  tags: [] as string[]
})

const newTag = ref('')
const showPreview = ref(false)
const submitting = ref(false)
const contentInput = ref<HTMLTextAreaElement>()

// 配置 marked（v5+ 不再支持在 setOptions 里使用 highlight）
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
  if (!post.value.content) return '<p class="empty-hint">内容预览将显示在这里...</p>'
  
  let content = post.value.content
  
  // 处理块级 LaTeX 公式 $$...$$
  content = content.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
    try {
      return '<div class="latex-block">' + katex.renderToString(formula.trim(), {
        displayMode: true,
        throwOnError: false
      }) + '</div>'
    } catch (e) {
      return '<div class="latex-error">LaTeX 渲染错误: ' + match + '</div>'
    }
  })
  
  // 处理行内 LaTeX 公式 $...$
  content = content.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
    try {
      return '<span class="latex-inline">' + katex.renderToString(formula, {
        displayMode: false,
        throwOnError: false
      }) + '</span>'
    } catch (e) {
      return '<span class="latex-error">' + match + '</span>'
    }
  })
  
  // 渲染 Markdown
  return md.parse(content) as string
})

const getCategoryName = (category: string) => {
  const names: Record<string, string> = {
    discussion: '讨论',
    question: '提问',
    share: '分享',
    tutorial: '教程',
    news: '资讯'
  }
  return names[category] || category
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !post.value.tags.includes(tag) && post.value.tags.length < 5) {
    post.value.tags.push(tag)
    newTag.value = ''
  }
}

const removeTag = (index: number) => {
  post.value.tags.splice(index, 1)
}

const insertMarkdown = (syntax: string) => {
  const textarea = contentInput.value
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = post.value.content
  
  post.value.content = text.substring(0, start) + syntax + text.substring(end)
  
  // 设置光标位置
  setTimeout(() => {
    textarea.focus()
    const newPos = start + syntax.indexOf('|') >= 0 ? syntax.indexOf('|') : syntax.length
    textarea.setSelectionRange(start + newPos, start + newPos)
  }, 0)
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

const goBack = () => {
  router.back()
}

const submitPost = async () => {
  if (!post.value.title.trim()) {
    alert('请输入标题')
    return
  }
  
  if (!post.value.content.trim()) {
    alert('请输入内容')
    return
  }
  
  submitting.value = true
  
  try {
    // 调用 API 发布帖子
    const newPost = await createPost(
      post.value.title.trim(),
      post.value.content.trim(),
      []  // 图片数组，暂时为空
    )
    
    alert('发布成功！')
    // 跳转到新帖子详情页
    router.push(`/post/${newPost.id}`)
  } catch (error) {
    console.error('发布失败:', error)
    alert('发布失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-post-page {
  min-height: 100vh;
  padding: 20px;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.page-container.preview-mode {
  grid-template-columns: 1fr 1fr;
}

.page-header {
  margin-bottom: 32px;
  text-align: center;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.page-description {
  color: var(--text-secondary);
  font-size: 16px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.category-select {
  width: 100%;
  padding: 12px 16px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 16px;
  outline: none;
  transition: var(--transition);
}

.category-select:focus {
  border-color: var(--glass-border);
  background: var(--glass-hover);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.editor-tools {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tool-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: var(--transition);
}

.tool-btn:hover {
  background: var(--glass-button);
}

.content-editor {
  width: 100%;
  min-height: 400px;
  padding: 16px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 15px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  transition: var(--transition);
}

.content-editor:focus {
  border-color: var(--glass-border);
  background: var(--glass-hover);
}

.content-editor::placeholder {
  color: var(--text-muted);
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  min-height: 48px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: var(--glass-button);
  border-radius: 16px;
  color: var(--text-primary);
  font-size: 14px;
}

.tag-remove {
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-input {
  flex: 1;
  min-width: 150px;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
}

.tag-input::placeholder {
  color: var(--text-muted);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.preview-section {
  position: sticky;
  top: 100px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.preview-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--glass-border);
}

.preview-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.preview-content {
  color: var(--text-primary);
}

.post-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.post-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--glass-border);
}

.post-category {
  padding: 4px 12px;
  background: var(--glass-button);
  border-radius: 12px;
  font-size: 14px;
  color: var(--text-primary);
}

.post-tags {
  display: flex;
  gap: 8px;
}

.tag {
  padding: 4px 12px;
  background: var(--glass-stat);
  border-radius: 12px;
  font-size: 12px;
  color: var(--text-secondary);
}

.post-body {
  line-height: 1.8;
  color: var(--text-primary);
}

.post-body :deep(h1) {
  font-size: 32px;
  font-weight: 800;
  margin: 32px 0 16px;
  color: var(--text-primary);
}

.post-body :deep(h2) {
  font-size: 28px;
  font-weight: 700;
  margin: 28px 0 14px;
  color: var(--text-primary);
}

.post-body :deep(h3) {
  font-size: 24px;
  font-weight: 600;
  margin: 24px 0 12px;
  color: var(--text-primary);
}

.post-body :deep(p) {
  margin: 16px 0;
  color: var(--text-primary);
}

.post-body :deep(code) {
  padding: 2px 8px;
  background: var(--glass-stat);
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  color: var(--text-primary);
}

.post-body :deep(pre) {
  margin: 16px 0;
  padding: 16px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  overflow-x: auto;
}

.post-body :deep(pre code) {
  padding: 0;
  background: transparent;
  border-radius: 0;
}

.post-body :deep(blockquote) {
  margin: 16px 0;
  padding-left: 16px;
  border-left: 4px solid var(--glass-border);
  color: var(--text-secondary);
}

.post-body :deep(ul), .post-body :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
}

.post-body :deep(li) {
  margin: 8px 0;
}

.post-body :deep(img) {
  max-width: 100%;
  border-radius: 12px;
  margin: 16px 0;
}

.post-body :deep(a) {
  color: var(--text-primary);
  text-decoration: underline;
}

.post-body :deep(.latex-block) {
  margin: 24px 0;
  padding: 16px;
  background: var(--glass-subtle);
  border-radius: 12px;
  overflow-x: auto;
  text-align: center;
}

.post-body :deep(.latex-inline) {
  display: inline-block;
  margin: 0 4px;
}

.post-body :deep(.latex-error) {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
}

.empty-hint {
  color: var(--text-muted);
  text-align: center;
  padding: 40px;
}

@media (min-width: 1024px) {
  .page-container {
    grid-template-columns: 1fr 1fr;
  }
  
  .editor-section {
    grid-column: span 1;
  }
}

@media (max-width: 1024px) {
  .preview-section {
    position: static;
    max-height: none;
  }
}
</style>
