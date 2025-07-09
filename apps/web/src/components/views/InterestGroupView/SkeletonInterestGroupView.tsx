import type { FC } from "react"

// TODO: Temp placeholder, fix
export const SkeletonInterestGroupView: FC = () => {
  return (
    <div className="p-14 my-16 mx-auto border-slate-200 rounded-lg border shadow-md w-10/12 h-[400px]">
      <div className="flex md:flex-row flex-col-reverse">
        <div className="mr-4">
          <h2 className="bg-slate-400 text-transparent rounded-2xl animate-pulse text-lg border-none">
            Lorem ipsumLorem ipsum
          </h2>
          <p className="mt-2 bg-slate-400 text-transparent rounded-2xl animate-pulse text-lg border-none h-[200px] w-full" />
        </div>
        <p className="w-[200px] min-w-[200px] h-[200px] py-auto ml-auto sm:mb-auto mb-9 mt-2 animate-pulse rounded-full bg-slate-400" />
      </div>
    </div>
  )
}
