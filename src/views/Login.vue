<template>
  <div class="login-page">
    <div class="animated-bg"></div>
    <div class="particles">
      <div class="particle"></div>
      <div class="particle"></div>
      <div class="particle"></div>
      <div class="particle"></div>
      <div class="particle"></div>
    </div>

    <div class="login-container">
      <GlassCard class="login-card">
        <div class="logo">
          <h1 class="gradient-text">动漫Hub</h1>
          <p class="subtitle">欢迎来到动漫爱好者的天堂</p>
        </div>


        <div class="tabs">
          <button
            :class="['tab', { active: activeTab === 'login' }]"
            @click="activeTab = 'login'"
          >
            登录
          </button>
          <button
            :class="['tab', { active: activeTab === 'register' }]"
            @click="activeTab = 'register'"
          >
            注册
          </button>
        </div>

        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="form">
          <GlassInput
            v-model="loginForm.username"
            label="用户名"
            placeholder="请输入用户名"
            icon="fas fa-user"
            autocomplete="username"
          />
          <GlassInput
            v-model="loginForm.password"
            type="password"
            label="密码"
            placeholder="请输入密码"
            icon="fas fa-lock"
            autocomplete="current-password"
          />
          <GlassButton type="submit" variant="primary" :loading="loading" class="submit-btn">
            登录
          </GlassButton>
        </form>

        <form v-else @submit.prevent="handleRegister" class="form">
          <GlassInput
            v-model="registerForm.username"
            label="用户名"
            placeholder="请输入用户名"
            icon="fas fa-user"
            autocomplete="username"
          />
          <GlassInput
            v-model="registerForm.email"
            type="email"
            label="邮箱"
            placeholder="请输入邮箱"
            icon="fas fa-envelope"
            autocomplete="email"
          />
          <GlassInput
            v-model="registerForm.password"
            type="password"
            label="密码"
            placeholder="请输入密码"
            icon="fas fa-lock"
            autocomplete="new-password"
          />
          <GlassInput
            v-model="registerForm.confirmPassword"
            type="password"
            label="确认密码"
            placeholder="请再次输入密码"
            icon="fas fa-lock"
            autocomplete="new-password"
          />
          <GlassButton type="submit" variant="primary" :loading="loading" class="submit-btn">
            注册
          </GlassButton>
        </form>

        <div class="footer">
          <button class="link-button" @click="goToHome">
            游客身份浏览
          </button>
        </div>
      </GlassCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import GlassCard from '@/components/GlassCard.vue'
import GlassInput from '@/components/GlassInput.vue'
import GlassButton from '@/components/GlassButton.vue'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref<'login' | 'register'>('login')
const loading = ref(false)

const loginForm = ref({
  username: '',
  password: ''
})

const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    alert('请填写完整信息')
    return
  }

  loading.value = true
  try {
    // 调用实际的登录 API
    await userStore.login(loginForm.value.username, loginForm.value.password)
    
    // 根据用户角色跳转
    if (userStore.user?.isAdmin) {
      alert('管理员登录成功！')
      router.push('/admin')
    } else {
      router.push('/')
    }
  } catch (error) {
    alert('登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  if (
    !registerForm.value.username ||
    !registerForm.value.email ||
    !registerForm.value.password ||
    !registerForm.value.confirmPassword
  ) {
    alert('请填写完整信息')
    return
  }

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    alert('两次密码输入不一致')
    return
  }

  loading.value = true
  try {
    await userStore.register(
      registerForm.value.username,
      registerForm.value.password,
      registerForm.value.email
    )
    alert('注册成功，请登录')
    activeTab.value = 'login'
  } catch (error) {
    alert('注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const goToHome = () => {
  router.push('/')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-container {
  width: 100%;
  max-width: 480px;
  z-index: 1;
  animation: fadeIn 0.6s ease-out;
}

.login-card {
  padding: 48px 40px;
}

.logo {
  text-align: center;
  margin-bottom: 40px;
}

.logo h1 {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 8px;
  animation: float 3s ease-in-out infinite;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 16px;
}

.test-hint {
  display: flex;
  gap: 12px;
  padding: 16px;
  margin-bottom: 24px;
  background: rgba(var(--primary-rgb), 0.1);
  border: 1px solid rgba(var(--primary-rgb), 0.3);
  border-radius: 12px;
  font-size: 13px;
}

.test-hint i {
  color: var(--primary-color);
  font-size: 20px;
  flex-shrink: 0;
}

.hint-content {
  flex: 1;
}

.hint-content strong {
  color: var(--text-primary);
  display: block;
  margin-bottom: 8px;
}

.hint-content p {
  margin: 4px 0;
  color: var(--text-secondary);
}

.hint-content code {
  padding: 2px 6px;
  background: var(--glass-subtle);
  border-radius: 4px;
  color: var(--primary-color);
  font-family: 'Courier New', monospace;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px;
  border-radius: 12px;
}

.tab {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: var(--transition);
}

.tab.active {
  background: var(--glass-bg);
  color: var(--text-primary);
  box-shadow: var(--shadow);
}

/* .tab:hover:not(.active): 不改变颜色/透明度 */

.form {
  margin-bottom: 24px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  font-size: 18px;
  margin-top: 8px;
}

.footer {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid var(--glass-border);
}

.link-button {
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: underline;
}

/* .link-button:hover: 不改变透明度 */

@media (max-width: 768px) {
  .login-card {
    padding: 32px 24px;
  }

  .logo h1 {
    font-size: 36px;
  }
}
</style>
