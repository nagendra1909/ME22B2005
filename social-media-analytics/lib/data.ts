import type { User, Post, Comment, ApiResponse } from "./types"

// Update the API_BASE_URL to use our proxy API
const API_BASE_URL = "/api/proxy"

// Cache for minimizing API calls
let usersCache: Record<string, string> | null = null
const postsCache: Record<string, any[]> = {}
const commentsCache: Record<number, Comment[]> = {}
const lastFetchTime: Record<string, number> = {}

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000

// Helper to check if cache is expired
const isCacheExpired = (cacheKey: string) => {
  if (!lastFetchTime[cacheKey]) return true
  return Date.now() - lastFetchTime[cacheKey] > CACHE_EXPIRATION
}

// Helper to update cache timestamp
const updateCacheTimestamp = (cacheKey: string) => {
  lastFetchTime[cacheKey] = Date.now()
}

// Fetch data with better error handling
async function fetchData<T>(path: string, cacheKey?: string): Promise<ApiResponse<T>> {
  // Check cache if cacheKey is provided
  if (cacheKey && !isCacheExpired(cacheKey)) {
    const cachedData = getCachedData<T>(cacheKey)
    if (cachedData) {
      return { data: cachedData, error: null, status: "success" }
    }
  }

  try {
    console.log(`Fetching data from: ${path}`)
    const response = await fetch(`${API_BASE_URL}?path=${path}`, {
      cache: "no-store",
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      console.error(`API error: ${path} - ${response.status} ${response.statusText}`)
      return {
        data: null,
        error: `Failed to fetch data: ${response.status} ${response.statusText}`,
        status: "error",
      }
    }

    const data = await response.json()

    // Update cache if cacheKey is provided
    if (cacheKey) {
      setCachedData(cacheKey, data)
      updateCacheTimestamp(cacheKey)
    }

    return { data, error: null, status: "success" }
  } catch (error) {
    console.error(`Error fetching ${path}:`, error)
    return {
      data: null,
      error: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      status: "error",
    }
  }
}

// Helper functions for cache management
function getCachedData<T>(key: string): T | null {
  if (key === "users") return usersCache as unknown as T
  if (key.startsWith("posts_")) {
    const userId = key.replace("posts_", "")
    return postsCache[userId] as unknown as T
  }
  if (key.startsWith("comments_")) {
    const postId = Number.parseInt(key.replace("comments_", ""))
    return commentsCache[postId] as unknown as T
  }
  return null
}

function setCachedData<T>(key: string, data: T): void {
  if (key === "users") usersCache = data as unknown as Record<string, string>
  if (key.startsWith("posts_")) {
    const userId = key.replace("posts_", "")
    postsCache[userId] = data as unknown as any[]
  }
  if (key.startsWith("comments_")) {
    const postId = Number.parseInt(key.replace("comments_", ""))
    commentsCache[postId] = data as unknown as Comment[]
  }
}

// Fetch all users
export async function fetchUsers(): Promise<Record<string, string>> {
  const result = await fetchData<{ users: Record<string, string> }>("/users", "users")

  if (result.status === "error" || !result.data) {
    console.error("Error fetching users:", result.error)
    return {}
  }

  return result.data.users || {}
}

// Fetch posts for a specific user
export async function fetchUserPosts(userId: string): Promise<any[]> {
  const result = await fetchData<{ posts: any[] }>(`/users/${userId}/posts`, `posts_${userId}`)

  if (result.status === "error" || !result.data) {
    console.error(`Error fetching posts for user ${userId}:`, result.error)
    return []
  }

  return result.data.posts || []
}

// Fetch comments for a specific post
export async function fetchPostComments(postId: number): Promise<Comment[]> {
  const result = await fetchData<{ comments: Comment[] }>(`/posts/${postId}/comments`, `comments_${postId}`)

  if (result.status === "error" || !result.data) {
    console.error(`Error fetching comments for post ${postId}:`, result.error)
    return []
  }

  return result.data.comments || []
}

// Fetch prime numbers
export async function fetchPrimes(): Promise<number[]> {
  const result = await fetchData<{ primes: number[] }>("/primes", "primes")

  if (result.status === "error" || !result.data) {
    console.error("Error fetching prime numbers:", result.error)
    return []
  }

  return result.data.primes || []
}

// Fetch random numbers
export async function fetchRandomNumbers(): Promise<number[]> {
  const result = await fetchData<{ numbers: number[] }>("/rand")

  if (result.status === "error" || !result.data) {
    console.error("Error fetching random numbers:", result.error)
    return []
  }

  return result.data.numbers || []
}

// Fetch top users with most commented posts
export async function fetchTopUsers(): Promise<User[]> {
  const users = await fetchUsers()

  if (!users || Object.keys(users).length === 0) {
    console.error("No users found")
    return []
  }

  const userIds = Object.keys(users)
  const userStats: User[] = []

  // Process in batches to avoid overwhelming the API
  const batchSize = 5
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize)

    await Promise.all(
      batch.map(async (userId) => {
        try {
          const posts = await fetchUserPosts(userId)

          if (!posts || posts.length === 0) {
            userStats.push({
              id: userId,
              name: users[userId] || `User ${userId}`,
              commentCount: 0,
              topPosts: [],
            })
            return
          }

          // Calculate total comments for each post
          const postsWithComments = await Promise.all(
            posts.map(async (post: any) => {
              const comments = await fetchPostComments(post.id)
              return {
                ...post,
                commentCount: comments?.length || 0,
              }
            }),
          )

          // Sort posts by comment count
          const sortedPosts = postsWithComments.sort((a, b) => b.commentCount - a.commentCount)

          // Calculate total comments across all posts
          const totalComments = sortedPosts.reduce((sum, post) => sum + post.commentCount, 0)

          userStats.push({
            id: userId,
            name: users[userId] || `User ${userId}`,
            commentCount: totalComments,
            topPosts: sortedPosts.slice(0, 3), // Get top 3 posts
          })
        } catch (error) {
          console.error(`Error processing user ${userId}:`, error)
          // Still add the user with empty data to avoid missing users
          userStats.push({
            id: userId,
            name: users[userId] || `User ${userId}`,
            commentCount: 0,
            topPosts: [],
          })
        }
      }),
    )
  }

  // Sort users by total comment count and get top 5
  return userStats.sort((a, b) => b.commentCount - a.commentCount).slice(0, 5)
}

// Fetch trending posts (posts with maximum comments)
export async function fetchTrendingPosts(): Promise<Post[]> {
  const users = await fetchUsers()

  if (!users || Object.keys(users).length === 0) {
    console.error("No users found")
    return []
  }

  const userIds = Object.keys(users)
  let allPosts: any[] = []

  // Process in batches to avoid overwhelming the API
  const batchSize = 5
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize)

    const batchPosts = await Promise.all(
      batch.map(async (userId) => {
        try {
          const posts = await fetchUserPosts(userId)
          return posts.map((post) => ({ ...post, userId }))
        } catch (error) {
          console.error(`Error fetching posts for user ${userId}:`, error)
          return []
        }
      }),
    )

    allPosts = [...allPosts, ...batchPosts.flat()]
  }

  if (allPosts.length === 0) {
    console.error("No posts found")
    return []
  }

  // Calculate comment count for each post
  const postsWithComments = await Promise.all(
    allPosts.map(async (post) => {
      try {
        const comments = await fetchPostComments(post.id)
        return {
          id: post.id,
          userId: post.userId,
          userName: users[post.userId] || `User ${post.userId}`,
          content: post.content || "No content available",
          commentCount: comments?.length || 0,
          recentComments: (comments || []).slice(0, 3), // Get 3 recent comments
        }
      } catch (error) {
        console.error(`Error processing post ${post.id}:`, error)
        return {
          id: post.id,
          userId: post.userId,
          userName: users[post.userId] || `User ${post.userId}`,
          content: post.content || "No content available",
          commentCount: 0,
          recentComments: [],
        }
      }
    }),
  )

  // Sort by comment count
  const sortedPosts = postsWithComments.sort((a, b) => b.commentCount - a.commentCount)

  if (sortedPosts.length === 0) {
    return []
  }

  // Get posts with maximum comments
  const maxComments = sortedPosts[0]?.commentCount || 0
  return sortedPosts.filter((post) => post.commentCount === maxComments)
}

// Fetch feed (newest posts)
export async function fetchFeed(): Promise<Post[]> {
  const users = await fetchUsers()

  if (!users || Object.keys(users).length === 0) {
    console.error("No users found")
    return []
  }

  const userIds = Object.keys(users)
  let allPosts: any[] = []

  // Limit to 10 users for performance, but randomize which users we fetch from
  // to ensure we get a diverse feed
  const shuffledUserIds = userIds.sort(() => 0.5 - Math.random()).slice(0, 10)

  // Collect recent posts from selected users
  await Promise.all(
    shuffledUserIds.map(async (userId) => {
      try {
        const posts = await fetchUserPosts(userId)

        // Add a timestamp for sorting (using post ID as a proxy for timestamp)
        const postsWithTimestamp = posts.map((post) => ({
          ...post,
          userId,
          timestamp: post.id, // Assuming higher IDs are newer
        }))

        allPosts = [...allPosts, ...postsWithTimestamp]
      } catch (error) {
        console.error(`Error fetching posts for user ${userId}:`, error)
      }
    }),
  )

  if (allPosts.length === 0) {
    console.error("No posts found for feed")
    return []
  }

  // Calculate comment count for each post
  const postsWithComments = await Promise.all(
    allPosts.map(async (post) => {
      try {
        const comments = await fetchPostComments(post.id)
        return {
          id: post.id,
          userId: post.userId,
          userName: users[post.userId] || `User ${post.userId}`,
          content: post.content || "No content available",
          commentCount: comments?.length || 0,
          recentComments: (comments || []).slice(0, 3), // Get 3 recent comments
          timestamp: post.timestamp,
        }
      } catch (error) {
        console.error(`Error processing post ${post.id}:`, error)
        return {
          id: post.id,
          userId: post.userId,
          userName: users[post.userId] || `User ${post.userId}`,
          content: post.content || "No content available",
          commentCount: 0,
          recentComments: [],
          timestamp: post.timestamp,
        }
      }
    }),
  )

  // Sort by timestamp (or post ID) to get newest posts first
  return postsWithComments.sort((a, b) => (b.timestamp || b.id) - (a.timestamp || a.id)).slice(0, 10) // Get 10 newest posts
}
