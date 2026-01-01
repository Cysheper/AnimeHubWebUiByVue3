import request from './request'
import type { SiteStats, Fortune, Developer, ApiResponse } from '@/types'

export const getSiteStats = async (): Promise<SiteStats> => {
  const response = await request.get<any, ApiResponse<SiteStats>>('/site/stats')
  return response.data
}

export const getDailyFortune = async (): Promise<Fortune> => {
  const response = await request.get<any, ApiResponse<Fortune>>('/site/fortune')
  return response.data
}

export const getDevelopers = async (): Promise<Developer[]> => {
  const response = await request.get<any, ApiResponse<Developer[]>>('/site/developers')
  return response.data
}
