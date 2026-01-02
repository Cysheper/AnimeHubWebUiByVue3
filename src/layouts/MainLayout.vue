<template>
  <div class="main-layout">
    <div class="animated-bg"></div>
    <div class="particles">
      <div class="particle"></div>
      <div class="particle"></div>
      <div class="particle"></div>
      <div class="particle"></div>
      <div class="particle"></div>
    </div>

    <header class="header glass">
      <div class="header-content">
        <div class="logo">
          <h1 class="gradient-text" v-on:click="">AnimeHub</h1>
        </div>

        <nav class="nav">
          <RouterLink to="/" class="nav-item" exact-active-class="active">
            <span class="nav-icon"><i class="fas fa-home"></i></span>
            <span>首页</span>
          </RouterLink>
          <RouterLink to="/hot" class="nav-item" active-class="active">
            <span class="nav-icon"><i class="fas fa-fire"></i></span>
            <span>热门</span>
          </RouterLink>
          <RouterLink to="/recommended" class="nav-item" active-class="active">
            <span class="nav-icon"><i class="fas fa-star"></i></span>
            <span>站长推荐</span>
          </RouterLink>
          <RouterLink to="/support" class="nav-item" active-class="active">
            <span class="nav-icon"><i class="fas fa-heart"></i></span>
            <span>支持我们</span>
          </RouterLink>
          <RouterLink v-if="user?.isAdmin" to="/admin" class="nav-item admin-nav" active-class="active">
            <span class="nav-icon"><i class="fas fa-shield-alt"></i></span>
            <span>管理</span>
          </RouterLink>
        </nav>

        <div class="user-actions">
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input
              v-model="searchKeyword"
              type="text"
              class="search-input"
              placeholder="搜索帖子..."
              @keydown.enter="handleSearch"
            />
          </div>
          <button v-if="!isLoggedIn" class="login-btn" @click="goToLogin">
            登录
          </button>
          <div v-else class="user-menu">
            <div class="user-info" @click="goToProfile">
              <img :src="user?.avatar" :alt="user?.username" class="user-avatar" />
              <span class="username">{{ user?.username }}</span>
            </div>
            <button class="logout-btn" @click="handleLogout">
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const user = computed(() => userStore.user)
const searchKeyword = ref('')

const goToLogin = () => {
  router.push('/login')
}

const goToProfile = () => {
  router.push('/profile')
}

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/search', query: { keyword: searchKeyword.value.trim() } })
    searchKeyword.value = ''
  }
}

onMounted(() => {
  if (isLoggedIn.value) {
    userStore.fetchUserInfo()
  }
})
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  position: relative;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  /* margin: 20px; 去掉左右边距，让顶部和下方一样宽 */
  border-radius: 0;
  /* animation: slideInRight 0.6s ease-out; 已去掉静态动效 */
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.logo h1 {
  font-size: 28px;
  font-weight: 800;
  margin: 0;
  cursor: pointer;
  transition: var(--transition);
}

.logo h1:hover {
  transform: scale(1.05);
}

.nav {
  display: flex;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 600;
  transition: var(--transition);
  position: relative;
}

.nav-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--text-primary);
  transform: translateX(-50%);
  transition: width 0.3s ease;
}

.nav-item:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.1);
}

.nav-item:hover::after {
  width: 60%;
}

.nav-item.active {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.15);
}

.nav-item.active::after {
  width: 60%;
}

.nav-item.admin-nav {
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.3);
}

.nav-item.admin-nav:hover {
  background: rgba(255, 59, 48, 0.2);
}

.nav-item.admin-nav.active {
  background: rgba(255, 59, 48, 0.25);
  border-color: #ff3b30;
}

.nav-icon {
  font-size: 20px;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
}

.search-icon {
  color: var(--text-muted);
  font-size: 14px;
}

.search-input {
  width: 160px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.login-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  background: var(--glass-icon-bg);
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

/* .login-btn:hover: 已去掉悬停动效 */

.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  transition: background 0.3s;
}

.user-info:hover {
  background: rgba(var(--primary-rgb), 0.1);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--glass-border);
}

.username {
  font-weight: 600;
  color: var(--text-primary);
}

.logout-btn {
  padding: 8px 12px;
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn:hover {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
  border-color: #ff3b30;
}

.main-content {
  padding: 20px;
  position: relative;
  z-index: 1;
}

@media (max-width: 1024px) {
  .nav {
    gap: 4px;
  }

  .nav-item {
    padding: 8px 16px;
    font-size: 14px;
  }

  .nav-icon {
    font-size: 18px;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .nav {
    width: 100%;
    justify-content: space-around;
  }

  .nav-item span:not(.nav-icon) {
    display: none;
  }

  .username {
    display: none;
  }
}
</style>
