import { type VariantProps, cva } from "cva"
import type { ComponentPropsWithRef, ElementType, PropsWithChildren, ReactNode } from "react"
import { cn } from "../../utils"

export const BUTTON_VARIANTS = ["solid", "outline", "pill", "text"] as const
export const BUTTON_COLORS = ["light", "slate", "dark", "brand", "blue", "green", "red", "yellow"] as const
export const BUTTON_SIZES = ["sm", "md", "lg"] as const

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number]
export type ButtonColor = (typeof BUTTON_COLORS)[number]
export type ButtonSize = (typeof BUTTON_SIZES)[number]

export const button = cva(
  [
    "font-poppins",
    "cursor-pointer appearance-none rounded-md",
    "transition-all",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ],
  {
    variants: {
      size: {
        sm: "text-sm px-3 py-1",
        md: "text-md px-3.5 py-1.5",
        lg: "text-lg px-4 py-1.5",
      },
      variant: {
        solid: "",
        outline: "border",
        pill: "rounded-full",
        text: "px-1 py-0.5",
      },
      color: {
        light: "",
        slate: "",
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
      color: "slate",
    },
    compoundVariants: [
      // light
      { color: "light", variant: "solid", className: "bg-slate-3 enabled:hover:bg-slate-4" },
      { color: "light", variant: "pill", className: "bg-slate-3 enabled:hover:bg-slate-4" },
      { color: "light", variant: "outline", className: "border-slate-5 enabled:hover:bg-slate-2" },
      { color: "light", variant: "text", className: "enabled:hover:bg-slate-3" },

      // slate
      { color: "slate", variant: "solid", className: "bg-slate-5 enabled:hover:bg-slate-6" },
      { color: "slate", variant: "pill", className: "bg-slate-5 enabled:hover:bg-slate-6" },
      { color: "slate", variant: "outline", className: "border-slate-7 enabled:hover:bg-slate-3" },
      { color: "slate", variant: "text", className: "enabled:hover:bg-slate-3" },

      // dark
      { color: "dark", variant: "solid", className: "bg-slate-11 enabled:hover:bg-slate-12 text-white" },
      { color: "dark", variant: "pill", className: "bg-slate-11 enabled:hover:bg-slate-12 text-white" },
      { color: "dark", variant: "outline", className: "border-slate-11 enabled:hover:bg-slate-11 enabled:hover:text-white" },
      { color: "dark", variant: "text", className: "enabled:hover:bg-slate-11 enabled:hover:text-white" },

      // brand
      { color: "brand", variant: "solid", className: "bg-brand-9 enabled:hover:bg-brand-10 text-white" },
      { color: "brand", variant: "pill", className: "bg-brand-9 enabled:hover:bg-brand-10 text-white" },
      { color: "brand", variant: "outline", className: "border-brand-9 text-brand-9 enabled:hover:bg-brand-9 enabled:hover:text-white" },
      { color: "brand", variant: "text", className: "text-brand-9 enabled:hover:bg-brand-3" },

      // blue
      { color: "blue", variant: "solid", className: "bg-blue-9 enabled:hover:bg-blue-10" },
      { color: "blue", variant: "pill", className: "bg-blue-9 enabled:hover:bg-blue-10" },
      { color: "blue", variant: "outline", className: "border-blue-8 text-blue-11 enabled:hover:bg-blue-3" },
      { color: "blue", variant: "text", className: "text-blue-11 enabled:hover:bg-blue-3" },

      // green
      { color: "green", variant: "solid", className: "bg-green-9 enabled:hover:bg-green-10" },
      { color: "green", variant: "pill", className: "bg-green-9 enabled:hover:bg-green-10" },
      { color: "green", variant: "outline", className: "border-green-8 text-green-11 enabled:hover:bg-green-3" },
      { color: "green", variant: "text", className: "text-green-11 enabled:hover:bg-green-3" },

      // red
      { color: "red", variant: "solid", className: "bg-red-9 enabled:hover:bg-red-10" },
      { color: "red", variant: "pill", className: "bg-red-9 enabled:hover:bg-red-10" },
      { color: "red", variant: "outline", className: "border-red-8 text-red-11 enabled:hover:bg-red-3" },
      { color: "red", variant: "text", className: "text-red-11 enabled:hover:bg-red-3" },

      // yellow
      { color: "yellow", variant: "solid", className: "bg-yellow-9 enabled:hover:bg-yellow-10" },
      { color: "yellow", variant: "pill", className: "bg-yellow-9 enabled:hover:bg-yellow-10" },
      { color: "yellow", variant: "outline", className: "border-yellow-8 text-yellow-11 enabled:hover:bg-yellow-3" },
      { color: "yellow", variant: "text", className: "text-yellow-11 enabled:hover:bg-yellow-3" },
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
      color: ButtonColor
      variant: ButtonVariant
      className: string
    }>
  }
)

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
  } & ComponentPropsWithRef<E>

export function Button<E extends ElementType>({
  element,
  children,
  variant,
  size,
  color,
  icon,
  className,
  ref,
  ...props
}: ButtonProps<E>) {
  const Component = element ?? "button"
  const classes = cn(button({ variant, size, color }), "inline-flex items-center justify-center gap-1", className)
  return (
    <Component className={classes} ref={ref} {...props}>
      {icon}
      {children}
    </Component>
  )
}
