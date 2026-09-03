import { cn } from "@dotkomonline/ui"

export const CourseCardSkeleton = () => {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-lg shadow-sm p-4 sm:p-6 grid grid-cols-[1fr_auto] gap-8 w-full border",
        "bg-white text-neutral-950 border-neutral-200",
        "dark:bg-stone-800 dark:text-stone-200 dark:border-stone-700",
        "transition-all duration-200"
      )}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <div className="h-7 flex items-center">
            <div className="h-5 w-1/2 rounded bg-neutral-200 dark:bg-stone-600 motion-safe:animate-pulse" />
          </div>
          <div className="h-6 flex items-center">
            <div className="h-4 w-1/5 rounded bg-neutral-200 dark:bg-stone-600 motion-safe:animate-pulse" />
          </div>
        </div>

        <div className="h-5 flex items-center">
          <div className="h-3.5 w-2/5 rounded bg-neutral-200 dark:bg-stone-600 motion-safe:animate-pulse" />
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 w-full">
        <div className="h-7 flex items-end">
          <div className="h-4 flex items-center">
            <div className="h-3 w-15 rounded bg-neutral-200 dark:bg-stone-600 motion-safe:animate-pulse" />
          </div>
        </div>

        <div className="h-12 w-8 rounded bg-neutral-200 dark:bg-stone-600 motion-safe:animate-pulse" />
      </div>
    </div>
  )
}
