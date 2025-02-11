import type { FC } from "react"

// TODO: Temp placeholder, fix
const SkeletonInterestGroupView: FC = () => {
  return (
    <div className="p-14 my-16 mx-auto border-slate-3 rounded-lg border shadow-md w-10/12 h-[400px]">
      <div className="flex md:flex-row flex-col-reverse">
        <div className="mr-4">
          <h2 className="bg-slate-5 text-transparent rounded-2xl animate-pulse text-lg border-none">
            Lorem ipsumLorem ipsum
          </h2>
          <p className="mt-2 bg-slate-5 text-transparent rounded-2xl animate-pulse text-lg border-none">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente eaque soluta, sit voluptatum possimus,
            impedit asperiores iste ex repudiandae sunt ipsam! Ullam quisquam earum atque culpa? Amet porro magni omnis!
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente eaque soluta, sit voluptatum possimus,
            impedit asperiores iste ex repudiandae sunt ipsam! Ullam quisquam earum atque culpa? Amet porro magni omnis!
          </p>
        </div>
        <p className="w-[200px] min-w-[200px] h-[200px] py-auto ml-auto sm:mb-auto mb-9 mt-2 animate-pulse rounded-full bg-slate-5" />
      </div>
    </div>
  )
}

export default SkeletonInterestGroupView
