import { Button, cn } from "@dotkomonline/ui"
import { IconCheck } from "@tabler/icons-react"

interface Props {
  children: React.ReactNode
  isActive?: boolean
  onClick: () => void
  className?: string
}

export const PopoverOptionButton = ({ children, isActive, onClick, className }: Props) => (
  <Button
    variant="text"
    onClick={onClick}
    className={cn(
      "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:hover:bg-stone-600 hover:text-neutral-900",
      isActive && "font-medium",
      className
    )}
  >
    <span className="flex items-center gap-2">{children}</span>
    {isActive && <IconCheck size={16} stroke={2} />}
  </Button>
)
