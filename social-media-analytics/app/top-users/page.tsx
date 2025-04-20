import TopUsersCard from "@/components/top-users-card"
import { Suspense } from "react"
import LoadingCard from "@/components/loading-card"
import { UsersInsights } from "@/components/users-insights"

export default async function TopUsersPage() {
  return (
    <div className="space-y-8">
      <UsersInsights />

      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white font-display">
            Most Engaged Users
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Users with the highest comment activity across the platform
          </p>
        </div>

        <Suspense fallback={<LoadingCard count={5} />}>
          <TopUsersCard />
        </Suspense>
      </div>
    </div>
  )
}
