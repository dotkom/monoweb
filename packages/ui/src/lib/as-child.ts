import { isValidElement, type ReactElement, type ReactNode } from "react"

type AsChildProps = {
  asChild?: boolean
  children?: ReactNode
}

export function resolveAsChildRender({ asChild, children }: AsChildProps): {
  render?: ReactElement
  children?: ReactNode
} {
  if (asChild && isValidElement(children)) {
    return { render: children, children: undefined }
  }

  return { children }
}

export function isNonButtonElement(element: ReactElement | undefined): boolean {
  if (!element) {
    return false
  }

  if (typeof element.type === "string") {
    return element.type !== "button"
  }

  return true
}
