"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export function ApiStatus() {
  const [status, setStatus] = useState<"loading" | "online" | "offline">("loading")
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [checking, setChecking] = useState(false)

  const checkApiStatus = async () => {
    setChecking(true)
    try {
      const response = await fetch("/api/proxy?path=/users")
      if (response.ok) {
        setStatus("online")
      } else {
        setStatus("offline")
      }
    } catch (error) {
      setStatus("offline")
    } finally {
      setLastChecked(new Date())
      setChecking(false)
    }
  }

  useEffect(() => {
    // Only run on client side to avoid hydration issues
    checkApiStatus()

    // Check API status every 5 minutes
    const interval = setInterval(
      () => {
        checkApiStatus()
      },
      5 * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="flex items-center gap-2 rounded-lg bg-white p-3 shadow-lg dark:bg-gray-800">
        <div className="flex items-center gap-2">
          {status === "loading" ? (
            <RefreshCw className="h-4 w-4 animate-spin text-yellow-500" />
          ) : status === "online" ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}

          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            API: {status === "loading" ? "Checking..." : status === "online" ? "Online" : "Offline"}
          </span>
        </div>

        {lastChecked && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Last checked: {lastChecked.toLocaleTimeString()}
          </span>
        )}

        <button
          onClick={checkApiStatus}
          disabled={checking}
          className="ml-2 rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
        >
          <RefreshCw className={`h-3 w-3 ${checking ? "animate-spin" : ""}`} />
        </button>
      </div>
    </motion.div>
  )
}
