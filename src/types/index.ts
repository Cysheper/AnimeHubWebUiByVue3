export interface User {
  id: number
  username: string
  email: string
  avatar: string
  signature?: string
  postsCount?: number
  likesCount?: number
  followersCount?: number 
  followingCount?: number 
  isAdmin?: boolean
  followingList?: any[]  // 关注的用户ID列表
  followersList?: any[]  // 粉丝的用户ID列表
  createdAt: string
}

export interface Post {
  id: number
  title: string
  content: string
  images?: string[]
  author: User
  likes: number
  commentCount: number
  viewCount: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
  comments: Comment[]
}

export interface Comment {
  id: number
  postId: number
  content: string
  author: User
  likes: number
  isLiked: boolean
  createdAt: string
}

export interface SiteStats {
  totalPosts: number
  todayPosts: number
  totalUsers: number
  onlineUsers: number
}

export interface Fortune {
  id: number
  title: string
  content: string
  type: 'great' | 'good' | 'normal' | 'bad'
  icon: string
}

export interface Developer {
  id: number
  name: string
  role: string
  avatar: string
  github?: string
  email?: string
  description: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterResponse {
  message: string
  user: User
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
