<template>
  <div class="hot-page">
    <div class="layout-grid">
      <aside class="sidebar">
        <SiteInfo />
      </aside>

      <section class="content">
        <GlassCard class="page-header">
          <h2 class="page-title">
            <span class="title-icon"><i class="fas fa-fire"></i></span>
            热门帖子
          </h2>
          <p class="page-description">这里是最受欢迎的帖子</p>
        </GlassCard>

        <div class="posts-section">
          <div v-if="loading" class="loading">
            <div class="loader"></div>
          </div>
          <div v-else class="posts-list">
            <PostCard
              v-for="post in hotPosts"
              :key="post.id"
              :post="post"
              @like="handleLike"
              @click="goToPost(post.id)"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostStore } from '@/stores/post'
import GlassCard from '@/components/GlassCard.vue'
import SiteInfo from '@/components/SiteInfo.vue'
import PostCard from '@/components/PostCard.vue'

const router = useRouter()
const postStore = usePostStore()

const loading = ref(false)
const hotPosts = ref(postStore.hotPosts)

const handleLike = async (postId: number) => {
  await postStore.likePost(postId)
}

const goToPost = (postId: number) => {
  router.push(`/post/${postId}`)
}

onMounted(async () => {
  loading.value = true
  try {
    await postStore.fetchHotPosts()
    hotPosts.value = postStore.hotPosts
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.hot-page {
  max-width: 1400px;
  margin: 0 auto;
}

.layout-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
  align-items: start;
}

.sidebar {
  position: sticky;
  top: 100px;
  /* animation: slideInLeft 0.6s ease-out; 已去掉静态动效 */
}

/* .content: 已去掉静态动效 */

.page-header {
  margin-bottom: 20px;
  background: var(--glass-secondary);
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 32px;
  /* animation: pulse 2s ease-in-out infinite; 已去掉静态动效 */
}

.page-description {
  color: var(--text-secondary);
  font-size: 16px;
}

.posts-section {
  min-height: 400px;
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

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 1024px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }
}
</style>
