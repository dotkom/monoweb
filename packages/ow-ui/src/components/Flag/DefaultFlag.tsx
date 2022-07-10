import { ReactNode } from "react"
import { FC, ReactElement, ReactFragment, ReactPortal } from "react"

export interface IProps {
  title: string
  children: ReactNode
}

const DefaultFlag: FC<IProps> = ({ children, title }) => {
  return (
    <div>
      <p>{title}</p>
      <p>{children}</p>
    </div>
  )
}

export default DefaultFlag
