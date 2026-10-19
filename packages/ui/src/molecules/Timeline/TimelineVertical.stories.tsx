import { Timeline } from "./Timeline"
import { timelineExamples, TimelineGallery, TimelineOverview } from "./Timeline.examples"

export default {
  title: "Timeline/Vertical",
  component: Timeline,
}

export const All = () => <TimelineOverview orientation="vertical" />

export const Colors = () => <TimelineGallery orientation="vertical" examples={timelineExamples.colors} />

export const Rail = () => <TimelineGallery orientation="vertical" examples={timelineExamples.rail} />

export const Labels = () => <TimelineGallery orientation="vertical" examples={timelineExamples.labels} />

export const Bleed = () => <TimelineGallery orientation="vertical" examples={timelineExamples.bleed} />

export const CustomMarkers = () => <TimelineGallery orientation="vertical" examples={timelineExamples.customMarkers} />

export const Grouping = () => <TimelineGallery orientation="vertical" examples={timelineExamples.grouping} />

export const Sorting = () => <TimelineGallery orientation="vertical" examples={timelineExamples.sorting} />

export const RichContent = () => <TimelineGallery orientation="vertical" examples={timelineExamples.richContent} />
