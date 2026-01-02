import request from './request'
import type { Post, Comment, ApiResponse, PaginatedResponse } from '@/types'

export const getPosts = async (page = 1, limit = 20): Promise<Post[]> => {
  const response = await request.get<any, ApiResponse<PaginatedResponse<Post>>>('/posts', {
    params: { page, limit }
  })
  return response.data.items
}

export const getHotPosts = async (page = 1, limit = 20): Promise<Post[]> => {
  const response = await request.get<any, ApiResponse<PaginatedResponse<Post>>>('/posts/hot', {
    params: { page, limit }
  })
  return response.data.items
}

export const getRecommendedPosts = async (page = 1, limit = 20): Promise<Post[]> => {
  const response = await request.get<any, ApiResponse<PaginatedResponse<Post>>>('/posts/recommended', {
    params: { page, limit }
  })
  return response.data.items
}

export const searchPosts = async (keyword: string, page = 1, limit = 20): Promise<Post[]> => {
  const response = await request.get<any, ApiResponse<PaginatedResponse<Post>>>('/posts/search', {
    params: { keyword, page, limit }
  })
  return response.data.items
}

export const getPostById = async (id: number): Promise<Post> => {
  const response = await request.get<any, ApiResponse<Post>>(`/posts/${id}`)
  return response.data
}

export const createPost = async (
  title: string,
  content: string,
  images?: string[]
): Promise<Post> => {
  const response = await request.post<any, ApiResponse<Post>>('/posts', {
    title,
    content,
    images
  })
  return response.data
}

export const updatePost = async (
  postId: number,
  title: string,
  content: string,
  images?: string[]
): Promise<Post> => {
  const response = await request.put<any, ApiResponse<Post>>(`/posts/${postId}`, {
    title,
    content,
    images
  })
  return response.data
}

export const likePost = async (postId: number): Promise<void> => {
  await request.post(`/posts/${postId}/like`)
}

export const createComment = async (postId: number, content: string): Promise<Comment> => {
  const response = await request.post<any, ApiResponse<Comment>>(`/posts/${postId}/comments`, {
    content
  })
  return response.data
}

export const likeComment = async (commentId: number): Promise<void> => {
  await request.post(`/comments/${commentId}/like`)
}

export const deletePost = async (postId: number): Promise<void> => {
  await request.delete(`/posts/${postId}`)
}

export const deleteComment = async (commentId: number): Promise<void> => {
  await request.delete(`/comments/${commentId}`)
}
