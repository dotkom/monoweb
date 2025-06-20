import type { IframeHTMLAttributes } from "react"

export type VideoProps = IframeHTMLAttributes<HTMLIFrameElement>

export function Video({ children, className, ...props }: VideoProps) {
  return (
    <iframe className={className} {...props}>
      {children}
    </iframe>
  )
}
