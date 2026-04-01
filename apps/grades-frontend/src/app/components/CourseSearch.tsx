import { cn, TextInput } from "@dotkomonline/ui"
import { IconSearch } from "@tabler/icons-react";

interface Props {
  className?: string
  placeholder?: string
}

export const CourseSearch = ({ className, placeholder }: Props) => {
  return (
    <div className={cn("relative", className)}>
      <IconSearch className="w-8 h-full pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3" />
      <TextInput
        className="pl-10 rounded-lg w-full h-full dark:border-none text-base"
        placeholder={placeholder}
      />
    </div>
  )
}
