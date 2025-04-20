"use client"

import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Users, MessageSquare, Activity, Eye } from "lucide-react"

export function Analytics() {
  const pathname = usePathname()

  // Only show on main pages
  if (!["/top-users", "/trending-posts", "/feed"].includes(pathname)) {
    return null
  }

  const stats = [
    {
      name: "Total Users",
      value: "20+",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      name: "Active Posts",
      value: "1,200+",
      icon: MessageSquare,
      color: "bg-purple-500",
    },
    {
      name: "Engagement Rate",
      value: "24.5%",
      icon: Activity,
      color: "bg-green-500",
    },
    {
      name: "Total Views",
      value: "12.4K",
      icon: Eye,
      color: "bg-amber-500",
    },
  ]

  return (
    <div className="mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative overflow-hidden rounded-xl bg-white p-6 shadow-md dark:bg-gray-800 dark:shadow-gray-900/30"
          >
            <div className="flex items-center">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.color} text-white`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 h-24 w-24 -mr-8 -mb-8 opacity-10">
              <stat.icon className="h-full w-full" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
