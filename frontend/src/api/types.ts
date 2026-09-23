import type { ArticleData } from '@/utils/interface'

export interface ApiResponse<T = unknown> {
  code: number
  data?: T
  message?: string
}

export interface LoginRequest {
  name: string
  psw: string
}

export interface RegisterRequest {
  name: string
  password: string
}

export interface LoginUser {
  id: number
  name: string
  token: string
}

export interface ArticleListRequest {
  token?: string
  nowPage?: number
  pageSize?: number
  state?: number
  searchTerm?: string
}

export interface ArticleListResponse extends ApiResponse<ArticleData[]> {
  count?: number
  list?: ArticleData[]
  result?: ArticleData[]
}

export interface ArticleDetailResponse extends ApiResponse<ArticleData> {}
