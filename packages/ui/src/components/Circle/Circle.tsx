import { type FC, type ReactNode } from "react";

import { cn } from "../../utils";

interface CircleProps {
  children?: ReactNode;
  color: string;
  size: number;
}

export const Circle: FC<CircleProps> = ({ children, color, size }) => (
  <div
    className={cn("float-left m-0 inline-flex flex-col justify-center rounded-[50%] text-center", color)}
    style={{ fontSize: 0.6 * size, height: size, width: size }}
  >
    {children}
  </div>
);

export default Circle;
