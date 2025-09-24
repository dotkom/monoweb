export const JobListingSkeleton = () => (
  <div className="border-gray-200 flex h-56 items-center justify-between rounded-lg border px-6 py-2 animate-pulse">
    <div className="flex flex-row items-center gap-8 w-full">
      <div className="hidden md:block w-[140px] h-[80px] bg-gray-300 dark:bg-stone-600 rounded-sm" />

      <div className="flex flex-col w-full gap-3">
        <div className="w-3/5 h-6 bg-gray-300 dark:bg-stone-600 rounded-sm" />
        <div className="w-1/3 h-4 bg-gray-300 dark:bg-stone-600 rounded-sm" />

        <div className="flex flex-row justify-between w-full">
          <div className="flex flex-col gap-2">
            <div className="w-28 h-4 bg-gray-300 dark:bg-stone-600 rounded-sm" />
            <div className="w-32 h-4 bg-gray-300 dark:bg-stone-600 rounded-sm" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="w-20 h-5 bg-gray-300 dark:bg-stone-600 rounded-sm" />
            <div className="w-32 h-4 bg-gray-300 dark:bg-stone-600 rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  </div>
)
