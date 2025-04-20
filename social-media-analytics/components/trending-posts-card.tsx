"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { fetchTrendingPosts } from "@/lib/data"
import { MessageSquare, Heart, Share2, AlertCircle, Bookmark, BarChart2, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import type { Post } from "@/lib/types"

// Generate a consistent color based on user ID
function getUserColor(userId: string) {
  // Simple hash function to generate a number from a string
  const hash = userId.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)

  // List of color combinations (from-to gradient pairs)
  const colors = [
    ["from-purple-400", "to-indigo-600"],
    ["from-pink-400", "to-rose-600"],
    ["from-emerald-400", "to-teal-600"],
    ["from-amber-400", "to-orange-600"],
    ["from-cyan-400", "to-blue-600"],
  ]

  // Use the hash to select a color combination
  const colorIndex = Math.abs(hash) % colors.length
  return colors[colorIndex]
}

// Generate a unique image for each post
function getPostImage(postId: number) {
  // List of image themes
  const themes = ["Nature", "Technology", "Abstract", "City", "Food", "Travel", "Business", "Art"]

  // Use the post ID to select a theme
  const themeIndex = postId % themes.length
  const theme = themes[themeIndex]

  return `/placeholder.svg?height=400&width=600&text=${theme}+Image`
}

export default function TrendingPostsCard() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    setIsRetrying(false)

    try {
      const trendingPosts = await fetchTrendingPosts()

      if (!trendingPosts || trendingPosts.length === 0) {
        setError("No trending posts available")
      } else {
        setPosts(trendingPosts)
      }
    } catch (error) {
      console.error("Error in TrendingPostsCard:", error)
      setError("Failed to load trending posts")
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setIsRetrying(true)
    loadData()
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden animate-pulse">
            <div className="h-64 bg-gray-200 dark:bg-gray-700"></div>
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Trending Posts</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center mx-auto"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {posts.map((post, index) => {
        const [fromColor, toColor] = getUserColor(post.userId)
        const postImage = getPostImage(post.id)

        return (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg"
          >
            <div className="relative">
              <div className="absolute top-4 right-4 z-10 flex space-x-2">
                <div className="bg-black/50 backdrop-blur-md rounded-full px-3 py-1 flex items-center text-white text-xs font-medium">
                  <BarChart2 className="h-3 w-3 mr-1" />
                  Trending
                </div>
              </div>
              <div className="relative h-64 sm:h-80 w-full">
                <Image src={postImage || "/placeholder.svg"} alt="Post image" fill className="object-cover" />
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center space-x-4 -mt-12">
                <div
                  className={`h-16 w-16 rounded-full bg-gradient-to-br ${fromColor} ${toColor} flex items-center justify-center text-white font-bold text-xl border-4 border-white dark:border-gray-800 shadow-md`}
                >
                  {post.userName?.charAt(0) || "?"}
                </div>
              </div>

              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{post.userName || "Unknown User"}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Posted recently</p>
                </div>

                <div className="mt-4">
                  <p className="text-lg text-gray-800 dark:text-gray-200">{post.content}</p>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
                      <Heart className="h-5 w-5" />
                      <span>Like</span>
                    </button>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <MessageSquare className="h-5 w-5" />
                      <span>{post.commentCount} comments</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="text-gray-500 hover:text-purple-500 transition-colors">
                      <Bookmark className="h-5 w-5" />
                    </button>
                    <button className="text-gray-500 hover:text-blue-500 transition-colors">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Recent Comments</h4>
                  <div className="space-y-4">
                    {post.recentComments && post.recentComments.length > 0 ? (
                      post.recentComments.map((comment) => (
                        <div key={comment.id} className="flex space-x-3">
                          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs font-medium">
                            {String.fromCharCode((comment.id % 26) + 65) /* A-Z */}
                          </div>
                          <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                            <p className="text-sm text-gray-800 dark:text-gray-200">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">No comments yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
