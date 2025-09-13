const SkeletonProfileForm = () => {
  const entry = (
    <div className="w-full flex flex-col gap-2">
      <div className="w-36 h-5 rounded-full bg-gray-300 dark:bg-stone-600 animate-pulse" />
      <div className="w-full h-10 rounded-md bg-gray-300 dark:bg-stone-600 animate-pulse" />
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {entry}
        {entry}
        {entry}
        {entry}
        <div className="min-w-24 w-96 max-w-[50%] aspect-square rounded-sm bg-gray-300 dark:bg-stone-600 animate-pulse" />
        <div className="w-full flex flex-col gap-1">
          <div className="w-36 h-6 rounded-full bg-gray-300 dark:bg-stone-600 animate-pulse" />
          <div className="w-full h-16 rounded-md bg-gray-300 dark:bg-stone-600 animate-pulse" />
        </div>
        {entry}
        {entry}
        {entry}
      </div>

      <div className="flex flex-row items-center gap-2">
        <div className="w-24 h-9 rounded-md bg-gray-300 dark:bg-stone-600 animate-pulse" />

        <div className="w-24 h-9 rounded-md bg-gray-300 dark:bg-stone-600 animate-pulse" />
      </div>
    </div>
  )
}

export default SkeletonProfileForm
