import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: '/hot',
        name: 'Hot',
        component: () => import('@/views/Hot.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: '/recommended',
        name: 'Recommended',
        component: () => import('@/views/Recommended.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: '/support',
        name: 'Support',
        component: () => import('@/views/Support.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: '/post/:id',
        name: 'PostDetail',
        component: () => import('@/views/PostDetail.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: '/create-post',
        name: 'CreatePost',
        component: () => import('@/views/CreatePost.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/post/:id/edit',
        name: 'EditPost',
        component: () => import('@/views/CreatePost.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/user/:id',
        name: 'UserProfile',
        component: () => import('@/views/UserProfile.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: '/admin',
        name: 'Admin',
        component: () => import('@/views/Admin.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: '/search',
        name: 'Search',
        component: () => import('@/views/SearchResult.vue'),
        meta: { requiresAuth: false }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()
  
  // 如果有 token 但用户信息还没加载，先加载用户信息
  if (userStore.token && !userStore.user) {
    try {
      await userStore.fetchUserInfo()
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // token 无效，跳转到登录页
      if (to.meta.requiresAuth || to.meta.requiresAdmin) {
        next('/login')
        return
      }
    }
  }
  
  // 检查是否需要登录
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
    return
  }
  
  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && !userStore.user?.isAdmin) {
    alert('您没有权限访问此页面')
    next('/')
    return
  }
  
  next()
})

export default router
