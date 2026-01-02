<template>
  <div class="search-page">
    <div class="search-header">
      <h1 class="search-title">
        <i class="fas fa-search"></i>
        搜索结果
      </h1>
      <p class="search-info" v-if="keyword">
        关键词: <span class="keyword">{{ keyword }}</span>
        <span v-if="!loading"> · 共 {{ posts.length }} 条结果</span>
      </p>
    </div>

    <div v-if="loading" class="loading">
      <div class="loader"></div>
    </div>

    <div v-else-if="posts.length === 0" class="empty-state">
      <i class="fas fa-search"></i>
      <p v-if="keyword">没有找到与 "{{ keyword }}" 相关的帖子</p>
      <p v-else>请输入关键词进行搜索</p>
    </div>

    <div v-else class="posts-list">
      <PostCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
        @like="handleLike"
        @click="goToPost(post.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchPosts } from '@/api/posts'
import { usePostStore } from '@/stores/post'
import PostCard from '@/components/PostCard.vue'
import type { Post } from '@/types'

const route = useRoute()
const router = useRouter()
const postStore = usePostStore()

const keyword = ref('')
const posts = ref<Post[]>([])
const loading = ref(false)

const search = async () => {
  if (!keyword.value.trim()) {
    posts.value = []
    return
  }

  loading.value = true
  try {
    posts.value = await searchPosts(keyword.value.trim())
  } catch (error) {
    console.error('搜索失败:', error)
    posts.value = []
  } finally {
    loading.value = false
  }
}

const handleLike = async (postId: number) => {
  await postStore.likePost(postId)
  await search()
}

const goToPost = (postId: number) => {
  router.push(`/post/${postId}`)
}

watch(
  () => route.query.keyword,
  (newKeyword) => {
    keyword.value = (newKeyword as string) || ''
    search()
  },
  { immediate: true }
)

onMounted(() => {
  keyword.value = (route.query.keyword as string) || ''
  if (keyword.value) {
    search()
  }
})
</script>

<style scoped>
.search-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.search-header {
  margin-bottom: 24px;
}

.search-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.search-title i {
  color: var(--primary-color);
}

.search-info {
  font-size: 14px;
  color: var(--text-secondary);
}

.keyword {
  color: var(--primary-color);
  font-weight: 600;
}

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

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.3;
}

.empty-state p {
  font-size: 16px;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
