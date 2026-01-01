<template>
  <GlassCard class="site-info">
    <div class="theme-toggle">
      <button @click="toggleTheme" class="theme-btn" :title="theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'">
        <span class="theme-icon"><i :class="theme === 'light' ? 'fas fa-sun' : 'fas fa-moon'"></i></span>
        <span class="theme-text">{{ theme === 'light' ? '亮色' : '暗色' }}</span>
      </button>
    </div>

    <div class="admin-section">
      <div class="admin-avatar">
        <img src="https://cdn.jsdelivr.net/gh/Cysheper/MyImages@main/uploads/mutsumi01(1).jpg" alt="站长" />
      </div>
      <h3 class="admin-name">Cysheper</h3>
      <p class="admin-title">站长</p>
    </div>

    <div class="stats-section">
      <div class="stat-item">
        <span class="stat-icon"><i class="fas fa-file-alt"></i></span>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalPosts }}</span>
          <span class="stat-label">总帖子数</span>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-icon"><i class="fas fa-plus-circle"></i></span>
        <div class="stat-info">
          <span class="stat-value">{{ stats.todayPosts }}</span>
          <span class="stat-label">今日新帖</span>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-icon"><i class="fas fa-users"></i></span>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalUsers }}</span>
          <span class="stat-label">注册用户</span>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-icon"><i class="fas fa-circle"></i></span>
        <div class="stat-info">
          <span class="stat-value">{{ stats.onlineUsers }}</span>
          <span class="stat-label">在线用户</span>
        </div>
      </div>
    </div>

    <div class="fortune-section">
      <h4 class="section-title"><i class="fas fa-dice"></i> 今日运势</h4>
      <div v-if="fortune" class="fortune-card" :class="fortune.type">
        <div class="fortune-icon">{{ fortune.icon }}</div>
        <h5 class="fortune-title">{{ fortune.title }}</h5>
        <p class="fortune-content">{{ fortune.content }}</p>
      </div>
      <GlassButton v-else variant="outline" @click="drawFortune" class="draw-btn">
        抽取今日运势
      </GlassButton>
    </div>

    <div class="today-recommend">
      <h4 class="section-title"><i class="far fa-star"></i> 今日推荐</h4>
      <p class="recommend-text">记得多看动漫，保持好心情！</p>
    </div>

    <div v-if="isLoggedIn" class="profile-link-section">
      <GlassButton variant="primary" @click="goToProfile" class="profile-btn">
        <i class="fas fa-user-circle"></i> 我的主页
      </GlassButton>
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import GlassCard from './GlassCard.vue'
import GlassButton from './GlassButton.vue'
import { getSiteStats, getDailyFortune } from '@/api/site'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import type { SiteStats, Fortune } from '@/types'

const router = useRouter()
const themeStore = useThemeStore()
const userStore = useUserStore()
const theme = computed(() => themeStore.theme)
const isLoggedIn = computed(() => userStore.isLoggedIn)

const stats = ref<SiteStats>({
  totalPosts: 0,
  todayPosts: 0,
  totalUsers: 0,
  onlineUsers: 0
})

const fortune = ref<Fortune | null>(null)

const toggleTheme = () => {
  themeStore.toggleTheme()
}

const goToProfile = () => {
  router.push('/profile')
}

const drawFortune = async () => {
  try {
    fortune.value = await getDailyFortune()
  } catch (error) {
    console.error('获取运势失败:', error)
  }
}

onMounted(async () => {
  try {
    stats.value = await getSiteStats()
  } catch (error) {
    console.error('获取站点统计失败:', error)
  }
})
</script>

<style scoped>
.site-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.theme-toggle {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--glass-border);
}

.theme-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--glass-button);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

/* .theme-btn:hover: 按钮不改变颜色/透明度 */

.theme-icon {
  font-size: 20px;
}

.theme-text {
  font-size: 14px;
}

.admin-section {
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--glass-border);
}

.admin-avatar {
  width: 200px;
  height: 200px;
  margin: 0 auto 16px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--glass-border);
  /* animation: float 3s ease-in-out infinite; 已去掉静态动效 */
}

.admin-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.admin-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.admin-title {
  font-size: 14px;
  color: var(--text-muted);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--glass-stat);
  border-radius: 12px;
  transition: var(--transition);
}

/* .stat-item:hover: 不改变颜色/透明度 */

.stat-icon {
  font-size: 24px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

.fortune-section {
  padding: 16px 0;
  border-top: 1px solid var(--glass-border);
  border-bottom: 1px solid var(--glass-border);
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.fortune-card {
  padding: 16px;
  background: var(--glass-subtle);
  border-radius: 12px;
  text-align: center;
  /* animation: fadeIn 0.5s ease-out; 已去掉静态动效 */
}

.fortune-card.great {
  background: var(--glass-secondary);
}

.fortune-card.good {
  background: var(--glass-fortune);
}

.fortune-card.normal {
  background: var(--glass-stat);
}

.fortune-card.bad {
  background: var(--glass-stat);
}

.fortune-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.fortune-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.fortune-content {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.draw-btn {
  width: 100%;
}

.today-recommend {
  padding-top: 16px;
}

.recommend-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  padding: 12px;
  background: var(--glass-subtle);
  border-radius: 12px;
  text-align: center;
}

.profile-link-section {
  padding-top: 16px;
  border-top: 1px solid var(--glass-border);
}

.profile-btn {
  width: 100%;
}
</style>
