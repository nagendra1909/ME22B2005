import TrendingPostsCard from "@/components/trending-posts-card"
import { Suspense } from "react"
import LoadingCard from "@/components/loading-card"
import { TrendingInsights } from "@/components/trending-insights"

export default async function TrendingPostsPage() {
  return (
    <div className="space-y-8">
      <TrendingInsights />

      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white font-display">
            Trending Content
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Posts with the highest engagement and comment activity</p>
        </div>

        <Suspense fallback={<LoadingCard count={3} />}>
          <TrendingPostsCard />
        </Suspense>
      </div>
    </div>
  )
}
