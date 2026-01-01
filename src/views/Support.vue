<template>
  <div class="support-page">
    <div class="content-wrapper">
      <GlassCard class="support-header">
        <h2 class="page-title">
          <span class="title-icon"><i class="fas fa-heart"></i></span>
          支持我们
        </h2>
        <p class="page-description">感谢你的支持，让我们一起打造更好的动漫社区！</p>
      </GlassCard>

      <div class="developers-section">
        <GlassCard>
          <h3 class="section-title"><i class="fas fa-laptop-code"></i> 开发团队</h3>
          <div class="developers-grid">
            <div v-for="dev in developers" :key="dev.id" class="developer-card">
              <div class="dev-avatar">
                <img :src="dev.avatar" :alt="dev.name" />
              </div>
              <h4 class="dev-name">{{ dev.name }}</h4>
              <p class="dev-role">{{ dev.role }}</p>
              <p class="dev-description">{{ dev.description }}</p>
              <div class="dev-links">
                <a v-if="dev.github" :href="dev.github" target="_blank" class="dev-link">
                  <span><i class="fab fa-github"></i> GitHub</span>
                </a>
                <a v-if="dev.email" :href="`mailto:${dev.email}`" class="dev-link">
                  <span><i class="fas fa-envelope"></i> Email</span>
                </a>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard class="donation-card">
          <h3 class="section-title"><i class="fas fa-coffee"></i> 请我们喝杯咖啡</h3>
          <p class="donation-text">
            如果你喜欢这个项目，可以通过以下方式支持我们：
          </p>
          <div class="donation-methods">
            <div class="donation-method">
              <div class="donation-icon"><i class="fab fa-weixin"></i></div>
              <h4>微信支付</h4>
              <p>扫描二维码支持</p>
            </div>
            <div class="donation-method">
              <div class="donation-icon"><i class="fab fa-alipay"></i></div>
              <h4>支付宝</h4>
              <p>扫描二维码支持</p>
            </div>
            <div class="donation-method">
              <div class="donation-icon"><i class="fab fa-github"></i></div>
              <h4>Star项目</h4>
              <p>在GitHub上给我们点个Star</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard class="tech-stack-card">
          <h3 class="section-title"><i class="fas fa-code"></i> 技术栈</h3>
          <div class="tech-tags">
            <span class="tech-tag">Vue 3</span>
            <span class="tech-tag">TypeScript</span>
            <span class="tech-tag">Vite</span>
            <span class="tech-tag">Pinia</span>
            <span class="tech-tag">Vue Router</span>
            <span class="tech-tag">Axios</span>
          </div>
          <p class="tech-description">
            本项目使用现代化的前端技术栈构建，追求极致的用户体验和性能表现。
          </p>
        </GlassCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import GlassCard from '@/components/GlassCard.vue'
import { getDevelopers } from '@/api/site'
import type { Developer } from '@/types'

const developers = ref<Developer[]>([])

onMounted(async () => {
  try {
    developers.value = await getDevelopers()
  } catch (error) {
    // 如果API失败，使用默认数据
    developers.value = [
      {
        id: 1,
        name: '主开发者',
        role: '全栈工程师',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=developer1',
        github: 'https://github.com',
        email: 'dev@animehub.com',
        description: '负责项目架构和核心功能开发'
      },
      {
        id: 2,
        name: 'UI设计师',
        role: '视觉设计师',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=designer',
        email: 'designer@animehub.com',
        description: '负责界面设计和用户体验'
      }
    ]
  }
})
</script>

<style scoped>
.support-page {
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.6s ease-out;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.support-header {
  text-align: center;
  background: var(--glass-secondary);
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-icon {
  font-size: 40px;
  /* animation: pulse 2s ease-in-out infinite; 已去掉静态动效 */
}

.page-description {
  color: var(--text-secondary);
  font-size: 18px;
  line-height: 1.6;
}

.developers-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.developers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.developer-card {
  text-align: center;
  padding: 24px;
  background: var(--glass-subtle);
  border-radius: 16px;
  transition: var(--transition);
}

.developer-card:hover {
  background: var(--glass-stat);
  /* transform: translateY(-4px); 已去掉悬停动效 */
}

.dev-avatar {
  width: 100px;
  height: 100px;
  margin: 0 auto 16px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--glass-border);
}

.dev-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dev-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.dev-role {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 12px;
  opacity: 0.8;
}

.dev-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
}

.dev-links {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.dev-link {
  padding: 8px 16px;
  background: var(--glass-stat);
  border-radius: 8px;
  color: var(--text-primary);
  text-decoration: none;
  font-size: 14px;
  transition: var(--transition);
}

.dev-link:hover {
  background: var(--glass-icon-bg);
  /* transform: translateY(-2px); 已去掉悬停动效 */
}

.donation-card {
  background: var(--glass-fortune);
}

.donation-text {
  color: var(--text-secondary);
  font-size: 16px;
  margin-bottom: 24px;
  text-align: center;
}

.donation-methods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.donation-method {
  text-align: center;
  padding: 24px;
  background: var(--glass-subtle);
  border-radius: 12px;
  transition: var(--transition);
}

.donation-method:hover {
  background: var(--glass-stat);
  /* transform: translateY(-4px); 已去掉悬停动效 */
}

.donation-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.donation-method h4 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.donation-method p {
  font-size: 14px;
  color: var(--text-secondary);
}

.tech-stack-card {
  background: var(--glass-fortune);
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.tech-tag {
  padding: 8px 16px;
  background: var(--glass-stat);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  transition: var(--transition);
}

.tech-tag:hover {
  background: var(--glass-icon-bg);
  /* transform: translateY(-2px); 已去掉悬停动效 */
}

.tech-description {
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }

  .title-icon {
    font-size: 32px;
  }

  .developers-grid {
    grid-template-columns: 1fr;
  }
}
</style>
