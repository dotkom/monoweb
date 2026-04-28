const SkeletonProfilePage = () => {
  return (
    <div className="flex flex-row gap-6">
      <div className="w-16 h-16 md:w-32 md:h-32 rounded-full bg-gray-300 dark:bg-stone-600 animate-pulse" />

      <div className="flex flex-col gap-3 grow">
        <div className="h-8 w-64 rounded-full bg-gray-300 dark:bg-stone-600 animate-pulse" />

        <div className="flex flex-col text-sm gap-1 md:flex-row md:items-center md:gap-2">
          <div className="w-32 h-5 rounded-full bg-gray-300 dark:bg-stone-600 animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-stone-600 animate-pulse" />
          <div className="w-36 h-5 rounded-full bg-gray-300 dark:bg-stone-600 animate-pulse" />
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <div className="w-72 max-w-[70%] h-6 rounded-full bg-gray-300 dark:bg-stone-600 animate-pulse" />
          <div className="w-48 max-w-[50%] h-6 rounded-full bg-gray-300 dark:bg-stone-600 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default SkeletonProfilePage
