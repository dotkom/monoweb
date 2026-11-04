import { cn } from "@dotkomonline/ui"
import type { ComponentPropsWithoutRef, ElementType } from "react"

export type SectionProps<E extends ElementType> = ComponentPropsWithoutRef<E> & {
  as?: E
}

export function Section<E extends ElementType>({ children, as, className, ...props }: SectionProps<E>) {
  const Component = as ?? "section"
  return (
    <Component className={cn("flex flex-col gap-4", className)} {...props}>
      {children}
    </Component>
  )
}
