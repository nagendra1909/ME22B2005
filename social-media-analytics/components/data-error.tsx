"use client"

import { motion } from "framer-motion"
import { AlertCircle, RefreshCw } from "lucide-react"

interface DataErrorProps {
  title?: string
  message?: string
  onRetry?: () => void
  isRetrying?: boolean
}

export function DataError({
  title = "Data Unavailable",
  message = "We're currently using demo data because the API is unavailable. Some features may be limited.",
  onRetry,
  isRetrying = false,
}: DataErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-8 rounded-xl bg-yellow-50 p-4 dark:bg-yellow-900/20"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">{title}</h3>
          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
            <p>{message}</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">
                <button
                  type="button"
                  onClick={onRetry}
                  disabled={isRetrying}
                  className="rounded-md bg-yellow-50 px-3 py-1.5 text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 dark:bg-yellow-900/30 dark:text-yellow-200 dark:hover:bg-yellow-900/50"
                >
                  <div className="flex items-center">
                    <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
                    {isRetrying ? "Retrying..." : "Retry"}
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
