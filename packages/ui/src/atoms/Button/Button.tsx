import { type VariantProps, cva } from "cva"
import type { ComponentPropsWithRef, ElementType, PropsWithChildren, ReactNode } from "react"
import { cn } from "../../utils"

// Add variants, colors, or sizes in the arrays below
// to add them to the component
export const BUTTON_VARIANTS = ["solid", "outline", "text", "unstyled"] as const
export const BUTTON_COLORS = ["light", "dark", "brand", "blue", "red"] as const
export const BUTTON_SIZES = ["sm", "md", "lg"] as const

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number]
export type ButtonColor = (typeof BUTTON_COLORS)[number]
export type ButtonSize = (typeof BUTTON_SIZES)[number]

export type ButtonProps<E extends ElementType = "button"> = VariantProps<typeof button> &
  PropsWithChildren & {
    /**
     * The HTML element to render the button as
     *
     * Defaults to an HTML <button> element, but can be used with the Link
     * component from 'next/link' to create a link that looks like a button
     */
    element?: E
    className?: string
    icon?: ReactNode
    iconRight?: ReactNode
  } & ComponentPropsWithRef<E>

export function Button<E extends ElementType = "button">({
  element,
  children,
  variant,
  size,
  color,
  icon,
  iconRight,
  className,
  ref,
  ...props
}: ButtonProps<E>) {
  const Component = element ?? "button"
  const classes = cn(button({ variant, size, color }), "inline-flex items-center justify-center gap-1", className)
  return (
    <Component className={classes} ref={ref} {...props}>
      {variant !== "unstyled" && icon}
      {children}
      {variant !== "unstyled" && iconRight}
    </Component>
  )
}

export const button = cva(
  [
    "font-body cursor-pointer appearance-none transition-colors",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "h-fit w-fit",
    "text-black dark:text-white",
  ],
  {
    variants: {
      size: {
        sm: "text-xs px-1.5 py-1 rounded-sm",
        md: "text-sm px-2.5 py-1 rounded-sm",
        lg: "text-base px-3 py-1.5 rounded-md",
      },
      variant: {
        solid: "",
        outline: "border",
        text: "px-1 py-0.5",
        unstyled: [
          "p-0 text-[length:inherit] dark:text-[length:inherit] bg-transparent border-0",
          "rounded-none transition-none disabled:opacity-100",
        ].join(" "),
      },
      color: {
        light: "",
        dark: "",
        brand: "",
        blue: "",
        red: "",
      },
    },
    defaultVariants: {
      size: "lg",
      variant: "solid",
      color: "light",
    },
    compoundVariants: [
      {
        color: "light",
        variant: "solid",
        className: [
          // Not using `enabled:` to make it easier to override
          "bg-gray-200 hover:bg-gray-100 disabled:hover:bg-gray-200",
          "dark:bg-stone-800 dark:hover:bg-stone-700 dark:disabled:hover:bg-stone-800",
        ].join(" "),
      },
      {
        color: "light",
        variant: "outline",
        className: [
          "border-gray-300 hover:bg-gray-200 disabled:hover:bg-inherit",
          "dark:border-stone-700 dark:hover:bg-stone-800 dark:disabled:hover:bg-inherit",
        ].join(" "),
      },
      {
        color: "light",
        variant: "text",
        className: [
          "hover:bg-gray-200 disabled:hover:bg-inherit",
          "dark:hover:bg-stone-800 dark:disabled:hover:bg-inherit",
        ].join(" "),
      },

      {
        color: "dark",
        variant: "solid",
        className: [
          "bg-gray-800 hover:bg-gray-700 disabled:hover:bg-gray-800",
          "dark:bg-stone-300 dark:hover:bg-stone-200 dark:disabled:hover:bg-stone-300",
          "text-white dark:text-black",
        ].join(" "),
      },
      {
        color: "dark",
        variant: "outline",
        className: [
          "border-gray-400 hover:border-gray-800 hover:bg-gray-800 disabled:hover:border-gray-400 disabled:hover:bg-inherit",
          "dark:border-stone-600 dark:hover:border-stone-300 dark:hover:bg-stone-300 dark:disabled:hover:border-stone-600 dark:disabled:hover:bg-inherit",
          "hover:text-white disabled:hover:text-inherit",
          "dark:hover:text-black dark:disabled:hover:text-inherit",
        ].join(" "),
      },
      {
        color: "dark",
        variant: "text",
        className: [
          "hover:bg-gray-800 disabled:hover:bg-inherit",
          "dark:hover:bg-stone-300 dark:disabled:hover:bg-inherit",
          "hover:text-white disabled:hover:text-inherit",
          "dark:hover:text-black dark:disabled:hover:text-inherit",
        ].join(" "),
      },

      {
        color: "brand",
        variant: "solid",
        className: [
          "bg-brand hover:bg-brand/80 disabled:hover:bg-brand",
          "dark:bg-brand dark:hover:bg-brand/80 dark:disabled:hover:bg-brand",
          "text-white",
        ].join(" "),
      },
      {
        color: "brand",
        variant: "outline",
        className: [
          "border-brand/50 hover:border-brand hover:bg-brand disabled:hover:border-brand/50 disabled:hover:bg-inherit",
          "dark:border-brand dark:hover:bg-brand dark:disabled:hover:bg-inherit",
          "hover:text-white disabled:hover:text-inherit",
          "dark:hover:text-white dark:disabled:hover:text-inherit",
        ].join(" "),
      },
      {
        color: "brand",
        variant: "text",
        className: [
          "hover:text-white hover:bg-brand disabled:hover:bg-inherit",
          "dark:hover:bg-brand dark:disabled:hover:bg-inherit",
        ].join(" "),
      },

      {
        color: "blue",
        variant: "solid",
        className: [
          "bg-blue-400 hover:bg-blue-300 disabled:hover:bg-blue-400",
          "dark:bg-blue-800 dark:hover:bg-blue-700 dark:disabled:hover:bg-blue-800",
        ].join(" "),
      },
      {
        color: "blue",
        variant: "outline",
        className: [
          "border-blue-200 hover:bg-blue-100 disabled:hover:bg-inherit",
          "dark:border-blue-400/40 dark:hover:text-white dark:hover:bg-blue-950 dark:disabled:hover:bg-inherit",
        ].join(" "),
      },
      {
        color: "blue",
        variant: "text",
        className: [
          "hover:bg-blue-200 disabled:hover:bg-inherit",
          "dark:hover:bg-blue-900 dark:disabled:hover:bg-inherit",
        ].join(" "),
      },

      {
        color: "red",
        variant: "solid",
        className: [
          "bg-red-400 hover:bg-red-300 disabled:hover:bg-red-400",
          "dark:bg-red-800 dark:hover:bg-red-700 dark:disabled:hover:bg-red-800",
        ].join(" "),
      },
      {
        color: "red",
        variant: "outline",
        className: [
          "border-red-200 hover:bg-red-100 disabled:hover:bg-inherit",
          "dark:border-red-400/40 dark:hover:text-white dark:hover:bg-red-950 dark:disabled:hover:bg-inherit",
        ].join(" "),
      },
      {
        color: "red",
        variant: "text",
        className: [
          "hover:bg-red-200 disabled:hover:bg-inherit",
          "dark:hover:bg-red-900 dark:disabled:hover:bg-inherit",
        ].join(" "),
      },
    ],
  } satisfies {
    variants: {
      size: Record<ButtonSize, string>
      variant: Record<ButtonVariant, string>
      color: Record<ButtonColor, string>
    }
    defaultVariants: {
      size: ButtonSize
      variant: ButtonVariant
      color: ButtonColor
    }
    compoundVariants: Array<{
      size?: ButtonSize
      variant?: ButtonVariant
      color?: ButtonColor
      className: string
    }>
  }
)
