import request from './request'
import type { Post, Comment, ApiResponse } from '@/types'

// 管理员统计数据类型
export interface AdminStats {
  totalPosts: number
  totalComments: number
  totalUsers: number
  activeUsers?: number
  todayPosts?: number
  todayComments?: number
}

// 分页响应类型
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// 获取管理员统计数据
export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await request.get<any, ApiResponse<AdminStats>>('/admin/stats')
  return response.data
}

// 获取所有帖子（管理员）
export const getAdminPosts = async (params: {
  page?: number
  pageSize?: number
  sortBy?: 'latest' | 'oldest' | 'mostLiked' | 'mostCommented'
  search?: string
}): Promise<PaginatedResponse<Post>> => {
  const response = await request.get<any, ApiResponse<PaginatedResponse<Post>>>('/admin/posts', { params })
  return response.data
}

// 获取所有评论（管理员）
export const getAdminComments = async (params: {
  page?: number
  pageSize?: number
  sortBy?: 'latest' | 'oldest'
  search?: string
}): Promise<PaginatedResponse<Comment>> => {
  const response = await request.get<any, ApiResponse<PaginatedResponse<Comment>>>('/admin/comments', { params })
  return response.data
}

// 删除帖子
export const deletePost = async (postId: number): Promise<void> => {
  await request.delete<any, ApiResponse<null>>(`/admin/posts/${postId}`)
}

// 删除评论
export const deleteComment = async (commentId: number): Promise<void> => {
  await request.delete<any, ApiResponse<null>>(`/admin/comments/${commentId}`)
}

// 批量删除帖子
export const batchDeletePosts = async (postIds: number[]): Promise<{ deletedCount: number }> => {
  const response = await request.delete<any, ApiResponse<{ deletedCount: number }>>('/admin/posts/batch', {
    data: { postIds }
  })
  return response.data
}

// 批量删除评论
export const batchDeleteComments = async (commentIds: number[]): Promise<{ deletedCount: number }> => {
  const response = await request.delete<any, ApiResponse<{ deletedCount: number }>>('/admin/comments/batch', {
    data: { commentIds }
  })
  return response.data
}
