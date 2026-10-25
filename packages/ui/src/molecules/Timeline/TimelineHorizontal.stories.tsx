import { Timeline } from "./Timeline"
import { timelineExamples, TimelineGallery, TimelineOverview } from "./Timeline.examples"

export default {
  title: "Timeline/Horizontal",
  component: Timeline,
}

export const All = () => <TimelineOverview orientation="horizontal" />

export const Colors = () => <TimelineGallery orientation="horizontal" examples={timelineExamples.colors} />

export const Rail = () => <TimelineGallery orientation="horizontal" examples={timelineExamples.rail} />

export const Labels = () => <TimelineGallery orientation="horizontal" examples={timelineExamples.labels} />

export const Bleed = () => <TimelineGallery orientation="horizontal" examples={timelineExamples.bleed} />

export const CustomMarkers = () => (
  <TimelineGallery orientation="horizontal" examples={timelineExamples.customMarkers} />
)

export const Grouping = () => <TimelineGallery orientation="horizontal" examples={timelineExamples.grouping} />

export const Sorting = () => <TimelineGallery orientation="horizontal" examples={timelineExamples.sorting} />

export const RichContent = () => <TimelineGallery orientation="horizontal" examples={timelineExamples.richContent} />

export const ItemAlignment = () => <TimelineGallery orientation="horizontal" examples={timelineExamples.alignment} />
