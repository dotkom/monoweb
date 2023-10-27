import { ComponentPropsWithoutRef, ElementType } from "react"

export type SectionProps<E extends ElementType> = {
  as?: E
} & ComponentPropsWithoutRef<E>

export function Section<E extends ElementType>({ children, as, ...props }: SectionProps<E>) {
  const Component = as ?? "section"
  return (
    <Component className="flex flex-col gap-3" {...props}>
      {children}
    </Component>
  )
}
