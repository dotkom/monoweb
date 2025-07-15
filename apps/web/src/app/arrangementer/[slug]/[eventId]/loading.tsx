import { cn } from "@dotkomonline/ui"
import { AttendanceCardSkeleton } from "../../components/AttendanceCard/AttendanceCard"
import { SkeletonEventHeader } from "../../components/EventHeader"

export default () => {
  const skeletonText = (min: number, max: number, height?: string) => (
    <div
      className={cn("h-4 bg-gray-300 dark:bg-stone-700 rounded-full animate-pulse", height)}
      style={{ width: `${Math.random() * (max - min) + min}%` }}
    />
  )

  const description = (
    <div className="flex flex-col gap-2">
      {skeletonText(40, 100)}
      {skeletonText(40, 100)}
      {skeletonText(40, 100)}
      {skeletonText(40, 100)}
      {skeletonText(40, 100)}
    </div>
  )

  const organizer = <div className="h-12 w-32 bg-gray-300 dark:bg-stone-700 rounded-md animate-pulse" />

  return (
    <div className="flex flex-col gap-8">
      <SkeletonEventHeader />

      <div className="flex w-full flex-col gap-8 md:flex-row">
        <div className="w-full flex flex-col gap-4 px-2 md:px-0 md:w-[60%]">
          {organizer}

          {description}
        </div>

        <div className="flex grow flex-col gap-8 sm:gap-4">
          <div className="sm:hidden h-0.5 rounded-full w-full bg-gray-200" />

          <AttendanceCardSkeleton />

          <div className="sm:hidden h-0.5 rounded-full w-full bg-gray-200" />

          {/* TimeLocationBox */}
        </div>
      </div>
    </div>
  )
}
