"use client"

import type { FC, PropsWithChildren } from "react"
import Tilt_ from "react-parallax-tilt"

type TiltProps = {
  className?: string
} & Exclude<typeof Tilt_.defaultProps, "children"> &
  PropsWithChildren

export const Tilt: FC<TiltProps> = ({ className, children, ...props }) => {
  return (
    <Tilt_
      glareEnable
      glareMaxOpacity={0.35}
      glareReverse={true}
      tiltMaxAngleX={3.5}
      tiltMaxAngleY={3.5}
      scale={1.01}
      transitionSpeed={1000}
      //
      className={className}
      {...props}
    >
      {children}
    </Tilt_>
  )
}
