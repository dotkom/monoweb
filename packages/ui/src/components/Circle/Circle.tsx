import { type FC, type ReactNode } from "react"
import { cn } from "../../utils"

interface CircleProps {
  size: number
  color: string
  children?: ReactNode
}

export const Circle: FC<CircleProps> = ({ children, size, color }) => (
  <div
    className={cn("float-left m-0 inline-flex flex-col justify-center rounded-[50%] text-center", color)}
    style={{ width: size, height: size, fontSize: 0.6 * size }}
  >
    {children}
  </div>
)

export default Circle
