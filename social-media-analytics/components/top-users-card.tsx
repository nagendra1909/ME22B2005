"use client"

import { useState, useEffect } from "react"
import { fetchTopUsers } from "@/lib/data"
import { Trophy, MessageSquare, AlertCircle, TrendingUp, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import type { User } from "@/lib/types"

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

export default function TopUsersCard() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    setIsRetrying(false)

    try {
      const topUsers = await fetchTopUsers()

      if (!topUsers || topUsers.length === 0) {
        setError("No user data available")
      } else {
        setUsers(topUsers)
      }
    } catch (error) {
      console.error("Error in TopUsersCard:", error)
      setError("Failed to load user data")
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setIsRetrying(true)
    loadData()
  }

  // Use useEffect to load data only on the client side
  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
        <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {users.map((user, index) => {
        const [fromColor, toColor] = getUserColor(user.id)

        return (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg group"
          >
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div
                    className={`h-16 w-16 rounded-full bg-gradient-to-br ${fromColor} ${toColor} flex items-center justify-center text-white font-bold text-xl shadow-md`}
                  >
                    {user.name?.charAt(0) || "?"}
                  </div>
                  {index < 3 && (
                    <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 shadow-md">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {user.name || "Unknown User"}
                  </h3>
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>{user.commentCount} comments</span>
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-full h-8 w-8 flex items-center justify-center">
                  <span className="text-xs font-bold">#{index + 1}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1 text-purple-500" />
                  Top Posts
                </h4>
                {user.topPosts && user.topPosts.length > 0 ? (
                  <ul className="space-y-3">
                    {user.topPosts.map((post) => (
                      <li key={post.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm">
                        <p className="text-gray-800 dark:text-gray-200">{post.content}</p>
                        <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          <span>{post.commentCount} comments</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">No posts available</p>
                )}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
