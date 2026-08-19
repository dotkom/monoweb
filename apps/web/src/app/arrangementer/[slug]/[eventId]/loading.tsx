import { cn } from "@dotkomonline/ui"
import { AttendanceCardSkeleton } from "../../components/AttendanceCard/AttendanceCard"
import { SkeletonEventHeader } from "../../components/EventHeader"

export default () => {
  const skeletonText = (min: number, max: number, height?: string) => (
    <div
      className={cn("h-4 bg-gray-300 dark:bg-stone-600 rounded-full animate-pulse", height)}
      style={{ width: `${Math.random() * (max - min) + min}%` }}
    />
  )

  const timeBox = (
    <div className="flex w-full min-w-0 flex-row items-center gap-3 p-2 -mx-2 rounded-xl sm:gap-4">
      <div className="size-11 shrink-0 rounded-md bg-gray-300 dark:bg-stone-600 animate-pulse" />
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="h-4 w-40 max-w-full rounded-full bg-gray-300 dark:bg-stone-600 animate-pulse" />
        <div className="h-4 w-28 max-w-full rounded-full bg-gray-300 dark:bg-stone-600 animate-pulse" />
      </div>
    </div>
  )

  const locationBox = (
    <div className="flex w-full min-w-0 flex-row items-center gap-3 p-2 -mx-2 rounded-xl sm:gap-4">
      <div className="size-11 shrink-0 rounded-md bg-gray-300 dark:bg-stone-600 animate-pulse" />
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="h-4 w-32 max-w-full rounded-full bg-gray-300 dark:bg-stone-600 animate-pulse" />
        <div className="h-4 w-44 max-w-full rounded-full bg-gray-300 dark:bg-stone-600 animate-pulse" />
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-8">
      <SkeletonEventHeader />

      <div className="flex w-full flex-col gap-8 md:flex-row text-base">
        <div className="w-full flex flex-col gap-6 md:w-[60%]">
          <div className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-3 min-[1150px]:grid-cols-2">
            {timeBox}
            {locationBox}
          </div>

          <div className="h-8 w-32 bg-gray-300 dark:bg-stone-600 rounded-md animate-pulse" />

          <div className="flex flex-col gap-2">
            {skeletonText(40, 100)}
            {skeletonText(40, 100)}
            {skeletonText(40, 100)}
            {skeletonText(40, 100)}
            {skeletonText(40, 100)}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-8 sm:gap-4 md:min-w-88 lg:min-w-104">
          <div className="sm:hidden h-1 rounded-full w-full bg-gray-200 dark:bg-stone-700" />
          <AttendanceCardSkeleton />
        </div>
      </div>
    </div>
  )
}
