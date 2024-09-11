import { SkeletonEventDescriptionAndByline } from "../components/EventDescriptionAndByline"
import { SkeletonEventHeader } from "../components/EventHeader"
import { TimeLocationBox } from "../components/TimeLocationBox/TimeLocationBox"

export default () => <div className="mt-8 flex flex-col gap-8">
    <SkeletonEventHeader />
    <div className="flex w-full flex-col md:flex-row">
        <SkeletonEventDescriptionAndByline/>
        <div className="flex-1 flex-col"/>
    </div>
</div>
