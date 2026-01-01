import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Post } from '@/types'
import { 
  getPosts, 
  getHotPosts, 
  getRecommendedPosts,
  getPostById,
  createPost as apiCreatePost,
  likePost as apiLikePost,
  createComment as apiCreateComment,
  likeComment as apiLikeComment
} from '@/api/posts'

export const usePostStore = defineStore('post', () => {
  const posts = ref<Post[]>([])
  const hotPosts = ref<Post[]>([])
  const recommendedPosts = ref<Post[]>([])
  const currentPost = ref<Post | null>(null)
  const loading = ref(false)

  const fetchPosts = async (page = 1, limit = 20) => {
    loading.value = true
    try {
      const data = await getPosts(page, limit)
      posts.value = data
    } finally {
      loading.value = false
    }
  }

  const fetchHotPosts = async (page = 1, limit = 20) => {
    loading.value = true
    try {
      const data = await getHotPosts(page, limit)
      hotPosts.value = data
    } finally {
      loading.value = false
    }
  }

  const fetchRecommendedPosts = async (page = 1, limit = 20) => {
    loading.value = true
    try {
      const data = await getRecommendedPosts(page, limit)
      recommendedPosts.value = data
    } finally {
      loading.value = false
    }
  }

  const fetchPostById = async (id: number) => {
    loading.value = true
    try {
      const data = await getPostById(id)
      currentPost.value = data
      return data
    } finally {
      loading.value = false
    }
  }

  const createPost = async (title: string, content: string, images?: string[]) => {
    const newPost = await apiCreatePost(title, content, images)
    posts.value.unshift(newPost)
    return newPost
  }

  const likePost = async (postId: number) => {
    await apiLikePost(postId)
    const post = posts.value.find(p => p.id === postId)
    if (post) {
      post.likes += 1
      post.isLiked = true
    }
    if (currentPost.value?.id === postId) {
      currentPost.value.likes += 1
      currentPost.value.isLiked = true
    }
  }

  const createComment = async (postId: number, content: string) => {
    const comment = await apiCreateComment(postId, content)
    if (currentPost.value?.id === postId) {
      currentPost.value.comments.push(comment)
      currentPost.value.commentCount += 1
    }
    return comment
  }

  const likeComment = async (commentId: number) => {
    await apiLikeComment(commentId)
    if (currentPost.value) {
      const comment = currentPost.value.comments.find(c => c.id === commentId)
      if (comment) {
        comment.likes += 1
        comment.isLiked = true
      }
    }
  }

  return {
    posts,
    hotPosts,
    recommendedPosts,
    currentPost,
    loading,
    fetchPosts,
    fetchHotPosts,
    fetchRecommendedPosts,
    fetchPostById,
    createPost,
    likePost,
    createComment,
    likeComment
  }
})
