import { Toggle } from "@dotkomonline/ui"
import { FC } from "react"

interface ToggleGroupProps {
  title: string
  description: string
  toggleLabel: string
}

const EmailToggleGroup: FC<ToggleGroupProps> = ({ title, description, toggleLabel }) => {
  return (
    <div className="pb-10">
      <h1 className="text-2xl font-medium">{title}</h1>
      <p className="pb-10 text-[18px]">{description}</p>
      <div className="flex max-w-xl flex-row justify-between">
        <p className="pb-8 text-sm font-medium">{toggleLabel}</p>
        <Toggle />
      </div>
      <hr />
    </div>
  )
}

export default EmailToggleGroup
