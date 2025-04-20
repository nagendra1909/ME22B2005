export interface User {
  id: string
  name: string
  commentCount: number
  topPosts: {
    id: number
    content: string
    commentCount: number
  }[]
}

export interface Post {
  id: number
  userId: string
  userName: string
  content: string
  commentCount: number
  recentComments: Comment[]
  timestamp?: number // For sorting by recency
}

export interface Comment {
  id: number
  postId: number
  content: string
  userId?: string
  userName?: string
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  status: "success" | "error" | "loading"
}
