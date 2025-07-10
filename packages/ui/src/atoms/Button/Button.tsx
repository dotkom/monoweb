import { type VariantProps, cva } from "cva"
import type { ComponentPropsWithRef, ElementType, PropsWithChildren, ReactNode } from "react"
import { cn } from "../../utils"

// Add variants, colors, or sizes in the arrays below
// to add them to the component
export const BUTTON_VARIANTS = ["solid", "outline", "pill", "text", "unstyled"] as const
export const BUTTON_COLORS = ["light", "dark", "brand", "blue", "green", "red", "yellow"] as const
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
    "font-body cursor-pointer appearance-none rounded-md transition-colors",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "text-black dark:text-white",
  ],
  {
    variants: {
      size: {
        sm: "text-sm px-2 py-1",
        md: "text-base px-2.5 py-1",
        lg: "text-lg px-3 py-1",
      },
      variant: {
        solid: "",
        outline: "border",
        pill: "rounded-full",
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
        green: "",
        red: "",
        yellow: "",
      },
    },
    defaultVariants: {
      size: "md",
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
        variant: "pill",
        className: [
          "bg-gray-200 hover:bg-gray-100 disabled:hover:bg-gray-200",
          "dark:bg-stone-900 dark:hover:bg-stone-700 dark:disabled:hover:bg-stone-900",
        ].join(" "),
      },
      {
        color: "light",
        variant: "outline",
        className: [
          "border-gray-400 hover:bg-gray-200 disabled:hover:bg-inherit",
          "dark:border-stone-800 dark:hover:bg-stone-900 dark:disabled:hover:bg-inherit",
        ].join(" "),
      },
      {
        color: "light",
        variant: "text",
        className: [
          "hover:bg-gray-200 disabled:hover:bg-inherit",
          "dark:hover:bg-stone-900 dark:disabled:hover:bg-inherit",
        ].join(" "),
      },

      {
        color: "dark",
        variant: "solid",
        className: [
          "bg-gray-800 hover:bg-gray-700 disabled:hover:bg-gray-800",
          "dark:bg-stone-200 dark:hover:bg-stone-100 dark:disabled:hover:bg-stone-200",
          "text-white dark:text-black",
        ].join(" "),
      },
      {
        color: "dark",
        variant: "pill",
        className: [
          "bg-gray-800 hover:bg-gray-700 disabled:hover:bg-gray-800",
          "dark:bg-stone-200 dark:hover:bg-stone-100 dark:disabled:hover:bg-stone-200",
          "text-white dark:text-black",
        ].join(" "),
      },
      {
        color: "dark",
        variant: "outline",
        className: [
          "border-gray-900 hover:bg-gray-900 disabled:hover:bg-inherit",
          "dark:border-gray-400 dark:hover:bg-gray-600 dark:disabled:hover:bg-inherit",
          "hover:text-white disabled:hover:text-inherit",
          "dark:hover:text-black dark:disabled:hover:text-inherit",
        ].join(" "),
      },
      {
        color: "dark",
        variant: "text",
        className: [
          "hover:bg-gray-950 disabled:hover:bg-inherit",
          "dark:hover:bg-gray-300 dark:disabled:hover:bg-inherit",
          "hover:text-white disabled:hover:text-inherit",
          "dark:hover:text-black dark:disabled:hover:text-inherit",
        ].join(" "),
      },

      {
        color: "brand",
        variant: "solid",
        className: [
          "bg-brand-800 hover:bg-brand-900 disabled:hover:bg-brand-800",
          "dark:bg-brand-800 dark:hover:bg-brand-900 dark:disabled:hover:bg-brand-800",
          "text-white dark:text-white",
        ].join(" "),
      },
      {
        color: "brand",
        variant: "pill",
        className: [
          "bg-brand-800 hover:bg-brand-900 disabled:hover:bg-brand-800",
          "dark:bg-brand-800 dark:hover:bg-brand-900 dark:disabled:hover:bg-brand-800",
          "text-white dark:text-white",
        ].join(" "),
      },
      {
        color: "brand",
        variant: "outline",
        className: [
          "border-brand-800 text-brand-800 hover:bg-brand-800 disabled:hover:bg-inherit",
          "dark:border-brand-800 dark:text-brand-950 dark:hover:bg-brand-800 dark:disabled:hover:bg-inherit",
          "hover:text-white disabled:hover:text-inherit",
          "dark:hover:text-white dark:disabled:hover:text-inherit",
        ].join(" "),
      },
      {
        color: "brand",
        variant: "text",
        className: [
          "text-brand-800 hover:bg-brand-200 disabled:hover:bg-inherit",
          "dark:text-brand-950 dark:hover:bg-brand-400 dark:disabled:hover:bg-inherit",
        ].join(" "),
      },

      {
        color: "blue",
        variant: "solid",
        className: [
          "bg-blue-800 hover:bg-blue-900 disabled:hover:bg-blue-800",
          "dark:bg-blue-800 dark:hover:bg-blue-900 dark:disabled:hover:bg-blue-800",
        ].join(" "),
      },
      {
        color: "blue",
        variant: "pill",
        className: [
          "bg-blue-800 hover:bg-blue-900 disabled:hover:bg-blue-800",
          "dark:bg-blue-800 dark:hover:bg-blue-900 dark:disabled:hover:bg-blue-800",
        ].join(" "),
      },
      {
        color: "blue",
        variant: "outline",
        className: [
          "border-blue-700 text-blue-950 hover:bg-blue-200 disabled:hover:bg-inherit",
          "dark:border-black dark:text-blue-800 dark:hover:text-white dark:hover:bg-black dark:disabled:hover:bg-inherit",
        ].join(" "),
      },
      {
        color: "blue",
        variant: "text",
        className: [
          "text-blue-950 hover:bg-blue-200 disabled:hover:bg-inherit",
          "dark:text-blue-300 dark:hover:bg-black dark:disabled:hover:bg-inherit",
        ].join(" "),
      },

      {
        color: "green",
        variant: "solid",
        className: [
          "bg-green-800 hover:bg-green-900 disabled:hover:bg-green-800",
          "dark:bg-green-800 dark:hover:bg-green-900 dark:disabled:hover:bg-green-800",
        ].join(" "),
      },
      {
        color: "green",
        variant: "pill",
        className: [
          "bg-green-800 hover:bg-green-900 disabled:hover:bg-green-800",
          "dark:bg-green-800 dark:hover:bg-green-900 dark:disabled:hover:bg-green-800",
        ].join(" "),
      },
      {
        color: "green",
        variant: "outline",
        className: [
          "border-green-700 text-green-950 hover:bg-green-200 disabled:hover:bg-inherit",
          "dark:border-black dark:text-green-800 dark:hover:bg-black dark:disabled:hover:bg-inherit",
        ].join(" "),
      },
      {
        color: "green",
        variant: "text",
        className: [
          "text-green-950 hover:bg-green-200 disabled:hover:bg-inherit",
          "dark:text-green-300 dark:hover:bg-black dark:disabled:hover:bg-inherit",
        ].join(" "),
      },

      {
        color: "red",
        variant: "solid",
        className: [
          "bg-red-800 hover:bg-red-900 disabled:hover:bg-red-800",
          "dark:bg-red-800 dark:hover:bg-red-900 dark:disabled:hover:bg-red-800",
        ].join(" "),
      },
      {
        color: "red",
        variant: "pill",
        className: [
          "bg-red-800 hover:bg-red-900 disabled:hover:bg-red-800",
          "dark:bg-red-800 dark:hover:bg-red-900 dark:disabled:hover:bg-red-800",
        ].join(" "),
      },
      {
        color: "red",
        variant: "outline",
        className: [
          "border-red-700 text-red-950 hover:bg-red-200 disabled:hover:bg-inherit",
          "dark:border-black dark:text-red-800 dark:hover:bg-black dark:disabled:hover:bg-inherit",
        ].join(" "),
      },
      {
        color: "red",
        variant: "text",
        className: [
          "text-red-950 hover:bg-red-200 disabled:hover:bg-inherit",
          "dark:text-red-300 dark:hover:bg-black dark:disabled:hover:bg-inherit",
        ].join(" "),
      },

      {
        color: "yellow",
        variant: "solid",
        className: [
          "bg-yellow-800 hover:bg-yellow-900 disabled:hover:bg-yellow-800",
          "dark:bg-yellow-800 dark:hover:bg-yellow-900 dark:disabled:hover:bg-yellow-800",
          "dark:text-black",
        ].join(" "),
      },
      {
        color: "yellow",
        variant: "pill",
        className: [
          "bg-yellow-800 hover:bg-yellow-900 disabled:hover:bg-yellow-800",
          "dark:bg-yellow-800 dark:hover:bg-yellow-900 dark:disabled:hover:bg-yellow-800",
          "dark:text-black",
        ].join(" "),
      },
      {
        color: "yellow",
        variant: "outline",
        className: [
          "border-yellow-700 text-yellow-950 hover:bg-yellow-200 disabled:hover:bg-inherit",
          "dark:border-black dark:text-yellow-800 dark:hover:bg-black dark:disabled:hover:bg-inherit",
        ].join(" "),
      },
      {
        color: "yellow",
        variant: "text",
        className: [
          "text-yellow-950 hover:bg-yellow-200 disabled:hover:bg-inherit",
          "dark:text-yellow-300 dark:hover:bg-black dark:disabled:hover:bg-inherit",
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
