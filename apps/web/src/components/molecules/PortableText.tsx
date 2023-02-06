import { BlockContentProps } from "@sanity/block-content-to-react"
import { FC, PropsWithChildren } from "react"
import PT from "react-portable-text"
import clsx from "clsx"
interface PortableTextProps {
  blocks: BlockContentProps["blocks"]
  className?: string
}
const PortableText: FC<PortableTextProps> = ({ blocks, className }) => (
  <PT
    content={blocks}
    className={clsx("prose", className)}
    serializers={{
      li: ({ children }: PropsWithChildren) => <li className="marker:text-amber-12 ml-4">{children}</li>,
      someCustomType: PortableText,
    }}
  />
)

export default PortableText
