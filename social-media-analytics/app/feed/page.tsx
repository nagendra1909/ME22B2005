import FeedCard from "@/components/feed-card"
import { Suspense } from "react"
import LoadingCard from "@/components/loading-card"
import { FeedInsights } from "@/components/feed-insights"

export default async function FeedPage() {
  return (
    <div className="space-y-8">
      <FeedInsights />

      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white font-display">
            Latest Activity
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Real-time updates of the newest posts across the platform</p>
        </div>

        <Suspense fallback={<LoadingCard count={5} />}>
          <FeedCard />
        </Suspense>
      </div>
    </div>
  )
}
