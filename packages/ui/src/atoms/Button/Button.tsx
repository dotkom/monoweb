"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { buttonSizeVariants, buttonVariants } from "#components/button"
import {
  buttonVariantExtensions,
  buttonVariantOverrides,
  isProjectButtonVariant,
  resolveShadcnButtonVariant,
  buttonColorClasses,
  resolveButtonColor,
  type ButtonColor,
  type ButtonVariant,
} from "#lib/button-extensions"
import {
  createElement,
  type ComponentPropsWithRef,
  type ElementType,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
} from "react"
import { cn } from "../../utils"

export type { ButtonColor, ButtonVariant } from "#lib/button-extensions"
export { buttonVariants as button }

type ButtonPrimitiveProps = ComponentPropsWithRef<typeof ButtonPrimitive>

export type ButtonProps<E extends ElementType = "button"> = Omit<ButtonPrimitiveProps, "render" | "nativeButton"> &
  PropsWithChildren & {
    element?: E
    variant?: ButtonVariant
    color?: ButtonColor
    size?: NonNullable<Parameters<typeof buttonVariants>[0]>["size"]
    icon?: ReactNode
    iconRight?: ReactNode
    className?: string
  } & ComponentPropsWithRef<E>

function isNonButtonElement(element: ElementType): boolean {
  if (typeof element === "string") {
    return element !== "button"
  }

  return true
}

function resolveButtonClassName({
  variant,
  size,
  color,
  className,
}: {
  variant: ButtonVariant
  size: NonNullable<Parameters<typeof buttonVariants>[0]>["size"]
  color?: ButtonColor
  className?: string
}): string {
  const effectiveColor = resolveButtonColor(variant, color)
  const shadcnVariant = resolveShadcnButtonVariant(variant)

  if (shadcnVariant) {
    const variantOverride = effectiveColor ? undefined : buttonVariantOverrides[shadcnVariant]

    return cn(
      buttonVariants({ variant: shadcnVariant, size }),
      variantOverride,
      effectiveColor && buttonColorClasses(effectiveColor, variant),
      className
    )
  }

  if (!isProjectButtonVariant(variant)) {
    return className ?? ""
  }

  return cn(
    buttonSizeVariants({ size }),
    buttonVariantExtensions[variant],
    effectiveColor && buttonColorClasses(effectiveColor, variant),
    className
  )
}

export function Button<E extends ElementType = "button">({
  element,
  children,
  variant = "secondary",
  size = "default",
  color,
  icon,
  iconRight,
  className,
  ref,
  ...props
}: ButtonProps<E>) {
  const usesRender = element !== undefined && element !== "button"
  const isUnstyled = variant === "unstyled"
  const content = (
    <>
      {!isUnstyled && icon}
      {children}
      {!isUnstyled && iconRight}
    </>
  )

  const renderElement = usesRender ? (createElement(element as ElementType, null) as ReactElement) : undefined

  return (
    <ButtonPrimitive
      data-slot="button"
      className={resolveButtonClassName({ variant, size, color, className })}
      nativeButton={usesRender && isNonButtonElement(element as ElementType) ? false : undefined}
      render={renderElement}
      ref={ref}
      {...props}
    >
      {content}
    </ButtonPrimitive>
  )
}
