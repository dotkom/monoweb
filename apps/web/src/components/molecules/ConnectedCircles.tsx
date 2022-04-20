import { Box } from "@components/primitives"
import { createStyles } from "@theme"
import { Circle } from "../atoms/Circle/Circle"
import { DottedLine } from "../atoms/DottedCurve"

interface ConnectedCircleProps {
  size: number
  lineColor: string
  circleColor: string
}

export const ConnectedCircles: React.FC<ConnectedCircleProps> = ({ size, lineColor, circleColor }) => {
  const style = styles.circle
  return (
    <Box css={{ minWidth: size, display: "flex", justifyContent: "center", alignItems: "center", margin: "auto" }}>
      <Circle size={size / 15} color={circleColor}>
        1
      </Circle>
      <Box css={{ ...style, width: size / 5, marginTop: size / 25 }}>
        {" "}
        <DottedLine color={lineColor}></DottedLine>
      </Box>
      <Circle size={size / 15} color={circleColor}>
        2
      </Circle>
      <Box css={{ ...style, transform: "rotate(-135deg)", width: size / 5, marginTop: -(size / 11) + 24 }}>
        <DottedLine color={lineColor}></DottedLine>
      </Box>
      <Circle size={size / 15} color={circleColor}>
        3
      </Circle>
      <Box css={{ ...style, width: size / 5, marginTop: size / 25 }}>
        <DottedLine color={lineColor}></DottedLine>
      </Box>
      <Circle size={size / 15} color={circleColor}>
        4
      </Circle>
    </Box>
  )
}

const styles = createStyles({
  circle: {
    float: "left",
    transform: "rotate(45deg)",
    position: "relative",
  },
})

export default ConnectedCircles
