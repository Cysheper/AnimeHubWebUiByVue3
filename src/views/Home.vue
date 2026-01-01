<template>
  <div class="home-page">
    <div class="layout-grid">
      <aside class="sidebar">
        <SiteInfo />
      </aside>

      <section class="content">
        <div class="create-post-section">
          <GlassCard class="create-post-card" clickable @click="goToCreatePost">
            <div class="create-post-prompt">
              <span class="prompt-icon"><i class="fas fa-pen"></i></span>
              <span class="prompt-text">分享你的动漫见解...</span>
            </div>
          </GlassCard>
        </div>

        <div class="posts-section">
          <div v-if="loading" class="loading">
            <div class="loader"></div>
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
const posts = ref(postStore.posts)

const handleLike = async (postId: number) => {
  await postStore.likePost(postId)
}

const goToPost = (postId: number) => {
  router.push(`/post/${postId}`)
}

const goToCreatePost = () => {
  router.push('/create-post')
}

onMounted(async () => {
  loading.value = true
  try {
    await postStore.fetchPosts()
    posts.value = postStore.posts
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.home-page {
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

.create-post-section {
  margin-bottom: 20px;
}

.create-post-card {
  cursor: pointer;
  padding: 20px;
}

.create-post-prompt {
  display: flex;
  align-items: center;
  gap: 12px;
}

.prompt-icon {
  font-size: 24px;
}

.prompt-text {
  color: var(--text-muted);
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

.create-post-form {
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
