import { SkeletonEventHeader } from "../../components/EventHeader"

export default () => (
  <div className="mt-8 flex flex-col gap-8">
    <SkeletonEventHeader />
    <div className="flex w-full flex-col md:flex-row">
      <div className="mr-10 w-full flex flex-col gap-8 md:w-[60%]" />
      <div className="flex-1 flex-col" />
    </div>
  </div>
)
