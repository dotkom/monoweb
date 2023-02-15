import { FC, useRef } from "react"
import { DateFieldState, DateSegment as DateSegmentType } from "@react-stately/datepicker"
import { useDateSegment } from "@react-aria/datepicker"

export type DateSegmentProps = {
  segment: DateSegmentType
  state: DateFieldState
}

export const DateSegment: FC<DateSegmentProps> = ({ segment, state }) => {
  const ref = useRef<HTMLDivElement>(null)
  const { segmentProps } = useDateSegment(segment, state, ref)

  return (
    <div
      {...segmentProps}
      ref={ref}
      style={{
        ...segmentProps.style,
        maxWidth: segment.maxValue != null ? String(segment.maxValue).length + 3 + "ch" : undefined,
      }}
    >
      {segment.text}
    </div>
  )
}
//
// function DateSegment({ segment, state }) {
//   let ref = useRef()
//   let { segmentProps } = useDateSegment(segment, state, ref)
//
//   return (
//     <Box
//       {...segmentProps}
//       ref={ref}
//       style={{
//         ...segmentProps.style,
//         fontVariantNumeric: "tabular-nums",
//         boxSizing: "content-box",
//       }}
//       minWidth={segment.maxValue != null && String(segment.maxValue).length + "ch"}
//       paddingX="0.5"
//       textAlign="end"
//       outline="none"
//       rounded="md"
//       color={segment.isPlaceholder ? "gray.500" : !segment.isEditable ? "gray.600" : "black"}
//       _focus={{
//         background: "blue.500",
//         color: "white",
//       }}
//     >
//       {segment.text}
//     </Box>
//   )
// }
