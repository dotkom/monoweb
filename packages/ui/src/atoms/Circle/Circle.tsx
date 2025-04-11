import type { FC, PropsWithChildren } from "react"
import { cn } from "../../utils"

export type CircleProps = PropsWithChildren & {
  size: number
  color: string
}

export const Circle: FC<CircleProps> = ({ children, size, color }) => (
  <div
    className={cn("float-left m-0 inline-flex flex-col justify-center rounded-[50%] text-center", color)}
    style={{ width: size, height: size, fontSize: 0.6 * size }}
  >
    {children}
  </div>
)
