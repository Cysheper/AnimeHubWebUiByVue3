import request from './request'
import type { LoginResponse, RegisterResponse, User, ApiResponse } from '@/types'

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await request.post<any, ApiResponse<LoginResponse>>('/auth/login', {
    username,
    password
  })
  console.log(response.data)
  return response.data
}

export const register = async (
  username: string,
  password: string,
  email: string
): Promise<RegisterResponse> => {
  const response = await request.post<any, ApiResponse<RegisterResponse>>('/auth/register', {
    username,
    password,
    email
  })
  return response.data
}

export const getUserInfo = async (): Promise<User> => {
  const response = await request.get<any, ApiResponse<User>>('/auth/user')
  return response.data
}

export const getUser = async (): Promise<User> => {
  const currentUserResponse = await request.get<any, ApiResponse<User>>('/auth/user')
  const currentUser = currentUserResponse.data

  const response = await request.get<any, ApiResponse<User>>(`/users/${currentUser.id}/profile`)
  return response.data
}

export const logout = async (): Promise<void> => {
  await request.post('/auth/logout')
}
