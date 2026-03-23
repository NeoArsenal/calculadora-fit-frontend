// app/components/DashboardSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton = () => (
  <main className="min-h-screen bg-gray-900 text-white p-6 lg:p-12 space-y-8">
    <Skeleton className="h-10 w-48 bg-gray-700" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 bg-gray-700 rounded-xl" />)}
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-2 space-y-8">
        <Skeleton className="h-[350px] bg-gray-700 rounded-xl" />
        <Skeleton className="h-64 bg-gray-700 rounded-xl" />
      </div>
      <aside><Skeleton className="h-64 bg-gray-700 rounded-xl" /></aside>
    </div>
  </main>
);