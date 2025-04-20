"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

export function FeedInsights() {
  const [activeTab, setActiveTab] = useState("engagement")

  const engagementData = [
    { hour: "00:00", posts: 5, comments: 12 },
    { hour: "04:00", posts: 3, comments: 8 },
    { hour: "08:00", posts: 8, comments: 24 },
    { hour: "12:00", posts: 12, comments: 45 },
    { hour: "16:00", posts: 15, comments: 56 },
    { hour: "20:00", posts: 10, comments: 32 },
  ]

  const categoryData = [
    { subject: "Technology", A: 120, fullMark: 150 },
    { subject: "Travel", A: 98, fullMark: 150 },
    { subject: "Food", A: 86, fullMark: 150 },
    { subject: "Fashion", A: 99, fullMark: 150 },
    { subject: "Sports", A: 85, fullMark: 150 },
    { subject: "Entertainment", A: 65, fullMark: 150 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
    >
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Feed Insights</h3>
          <div className="mt-3 sm:mt-0 flex space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("engagement")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "engagement"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "categories"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Categories
            </button>
          </div>
        </div>

        <div className="h-80">
          {activeTab === "engagement" ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="hour" tick={{ fill: "#6B7280" }} />
                <YAxis tick={{ fill: "#6B7280" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "0.5rem",
                    color: "#F9FAFB",
                  }}
                />
                <Bar dataKey="posts" name="Posts" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="comments" name="Comments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={categoryData}>
                <PolarGrid stroke="#374151" opacity={0.3} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#6B7280" }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={{ fill: "#6B7280" }} />
                <Radar name="Engagement" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "0.5rem",
                    color: "#F9FAFB",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </motion.div>
  )
}
