"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MessageSquare, Heart, Share2, RefreshCw, AlertCircle, Bookmark, MoreHorizontal } from "lucide-react"
import { fetchFeed } from "@/lib/data"
import type { Post } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"

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

export default function FeedCard() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({})
  const [savedPosts, setSavedPosts] = useState<Record<number, boolean>>({})

  useEffect(() => {
    loadFeed()

    // Set up polling for real-time updates
    const interval = setInterval(() => {
      refreshFeed()
    }, 30000) // Poll every 30 seconds

    return () => clearInterval(interval)
  }, [retryCount])

  const loadFeed = async () => {
    setLoading(true)
    setError(null)
    try {
      const feedData = await fetchFeed()
      setPosts(feedData)
    } catch (error) {
      console.error("Error loading feed:", error)
      setError("Failed to load feed data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const refreshFeed = async () => {
    setRefreshing(true)
    setError(null)
    try {
      const feedData = await fetchFeed()
      setPosts(feedData)
    } catch (error) {
      console.error("Error refreshing feed:", error)
      setError("Failed to refresh feed data. Please try again later.")
    } finally {
      setRefreshing(false)
    }
  }

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  const toggleLike = (postId: number) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }))
  }

  const toggleSave = (postId: number) => {
    setSavedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }))
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-pulse">
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
            <div className="mt-6 h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-6" />
        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Error Loading Feed</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center mx-auto"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Retrying..." : "Try Again"}
        </button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-yellow-500 mb-6" />
        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">No Posts Available</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          There are no posts to display at this time. Please check back later.
        </p>
        <button
          onClick={refreshFeed}
          disabled={refreshing}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center mx-auto"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sticky top-0 z-10 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Latest Posts</h2>
        <button
          onClick={refreshFeed}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Refreshing..." : "Refresh Feed"}</span>
        </button>
      </div>

      <AnimatePresence>
        {posts.map((post, index) => {
          const [fromColor, toColor] = getUserColor(post.userId)
          const postImage = getPostImage(post.id)
          const isLiked = likedPosts[post.id] || false
          const isSaved = savedPosts[post.id] || false

          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`h-12 w-12 rounded-full bg-gradient-to-br ${fromColor} ${toColor} flex items-center justify-center text-white font-bold shadow-md`}
                    >
                      {post.userName?.charAt(0) || "?"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{post.userName || "Unknown User"}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Just now</p>
                    </div>
                  </div>
                  <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-lg text-gray-800 dark:text-gray-200">{post.content}</p>
                </div>

                <div className="mt-6">
                  <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-md group">
                    <Image
                      src={postImage || "/placeholder.svg"}
                      alt="Post image"
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center space-x-1 transition-colors ${
                        isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                      <span>{isLiked ? "Liked" : "Like"}</span>
                    </button>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <MessageSquare className="h-5 w-5" />
                      <span>{post.commentCount} comments</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleSave(post.id)}
                      className={`transition-colors ${
                        isSaved ? "text-purple-500" : "text-gray-500 hover:text-purple-500"
                      }`}
                    >
                      <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
                    </button>
                    <button className="text-gray-500 hover:text-blue-500 transition-colors">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
