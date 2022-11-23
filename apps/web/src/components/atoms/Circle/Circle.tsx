import { Box } from "@components/primitives"

const circleStyle = {
  color: "$white",
  textAlign: "center",
  borderRadius: "50%",
  display: "inline-flex",
  float: "left",
  flexDirection: "column",
  justifyContent: "center",
  margin: 0,
}
interface CircleProps {
  size: number
  color: string
  children?: React.ReactNode
}

export const Circle: React.FC<CircleProps> = ({ children, size, color }) => {
  return <Box css={{ width: size, height: size, fontSize: 0.6 * size, bg: color, ...circleStyle }}>{children}</Box>
}

export default Circle
