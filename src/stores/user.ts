import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { login as apiLogin, register as apiRegister, getUserInfo, getUser} from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoggedIn = ref<boolean>(!!token.value)

  // 关注列表
  const followingList = computed(() => user.value?.followingList || [])

  // 检查是否关注了某用户
  const isFollowing = (userId: number) => {
    console.log(user)
    if (!user.value || !user.value.followingList) {
      return false
    }
    for (const id of user.value.followingList) {
      if (id.following_id === userId) {
        return true
      }
    }
    return false
  }

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
    isLoggedIn.value = true
  }

  const setUser = (userData: User) => {
    user.value = userData
  }

  // 添加关注
  const addFollowing = async (userId: number) => {
    if (!user.value || isFollowing(userId)) return false
    
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
      
      if (response.ok) {
        fetchUserInfo()
        return true
      }
    } catch (error) {
      console.error('关注失败:', error)
    }
    return false
  }

  // 取消关注
  const removeFollowing = async (userId: number) => {
    if (!user.value || !isFollowing(userId)) return false
    
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })
      
      if (response.ok) {
        fetchUserInfo()
        return true
      }
    } catch (error) {
      console.error('取消关注失败:', error)
    }
    return false
  }

  // 切换关注状态
  const toggleFollow = async (userId: number) => {
    if (isFollowing(userId)) {
      return await removeFollowing(userId)
    } else {
      return await addFollowing(userId)
    }
  }

  const login = async (username: string, password: string) => {
    const response = await apiLogin(username, password)
    setToken(response.token)
    setUser(response.user)
    return response
  }

  const register = async (username: string, password: string, email: string) => {
    const response = await apiRegister(username, password, email)
    return response
  }

  const logout = () => {
    user.value = null
    token.value = null
    isLoggedIn.value = false
    localStorage.removeItem('token')
  }

  const fetchUserInfo = async () => {
    if (token.value) {
      try {
        // 先获取基本用户信息（包含 isAdmin）
        const us = await getUserInfo()
        
        // 获取详细用户信息
        const userData = await getUser()
        userData.followersCount = userData.followersList?.length ?? 0
        userData.followingCount = userData.followingList?.length ?? 0
        
        // 保留 isAdmin 字段（可能 profile 接口不返回这个字段）
        userData.isAdmin = userData.isAdmin ?? us.isAdmin
        
        setUser(userData)
        return userData  // 返回用户数据
      } catch (error) {
        console.error('获取用户信息失败:', error)
        logout()
        throw error  // 向上抛出错误
      }
    } else {
      throw new Error('未登录')
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    followingList,
    isFollowing,
    setToken,
    setUser,
    addFollowing,
    removeFollowing,
    toggleFollow,
    login,
    register,
    logout,
    fetchUserInfo
  }
})
