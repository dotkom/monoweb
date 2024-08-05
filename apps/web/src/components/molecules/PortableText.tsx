import {
  PortableText as ReactPortableText,
  type PortableTextProps as ReactPortableTextProps,
} from "@portabletext/react"
import type { FC, PropsWithChildren } from "react"

export interface PortableTextProps {
  blocks: ReactPortableTextProps["value"]
  className?: string
}
const PortableText: FC<PortableTextProps> = ({ blocks }) => (
  <ReactPortableText
    value={blocks}
    components={{
      listItem: ({ children }: PropsWithChildren) => <li className="marker:text-amber-12 ml-4">{children}</li>,
    }}
  />
)

export default PortableText
