import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-white overflow-hidden">
      {/* Navigation Bar with Tabs - Skeleton */}
      <div className="border-b border-zinc-800 bg-zinc-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-12">
            <Skeleton className="h-5 w-5 rounded-full bg-zinc-800" />
            <Skeleton className="h-4 w-32 ml-4 bg-zinc-800" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Prompt Set Tabs - Skeleton */}
        <div className="py-2 px-4 border-b border-zinc-700">
          <div className="flex items-center">
            <div className="flex-1 overflow-x-auto">
              <div className="flex space-x-2">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-7 w-32 bg-zinc-800 rounded-md" />
                ))}
              </div>
            </div>
            <Skeleton className="h-7 w-7 ml-2 bg-zinc-800 rounded-md" />
          </div>
        </div>

        {/* Content Area - Skeleton */}
        <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden h-0 min-h-0">
          {/* Variables Column */}
          <div className="flex flex-col min-h-0 h-full">
            <div className="bg-zinc-800 rounded-md p-4 h-full flex flex-col min-h-0">
              <Skeleton className="h-5 w-24 mb-4 bg-zinc-700" />
              <div className="flex-1 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-4 w-32 bg-zinc-700" />
                    <Skeleton className="h-20 w-full bg-zinc-700" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-8 w-full mt-4 bg-zinc-700" />
            </div>
          </div>

          {/* Prompts Column */}
          <div className="flex flex-col min-h-0 h-full">
            <div className="flex-1 space-y-4 pr-2">
              {[1, 2].map((i) => (
                <div key={i} className="bg-zinc-800 rounded-md p-4">
                  <Skeleton className="h-24 w-full bg-zinc-700 rounded mb-2" />
                  <div className="flex justify-end space-x-2">
                    <Skeleton className="h-8 w-8 bg-zinc-700 rounded" />
                    <Skeleton className="h-8 w-8 bg-zinc-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 flex justify-end">
              <Skeleton className="h-8 w-8 bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
