import { type VariantProps, cva } from "cva"
import type { ComponentPropsWithRef, ElementType, PropsWithChildren, ReactNode } from "react"
import { cn } from "../../utils"

// Add variants, colors, or sizes in the arrays below
// to add them to the component
export const BUTTON_VARIANTS = ["solid", "outline", "pill", "text"] as const
export const BUTTON_COLORS = ["light", "slate", "dark", "brand", "blue", "green", "red", "yellow"] as const
export const BUTTON_SIZES = ["sm", "md", "lg"] as const

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number]
export type ButtonColor = (typeof BUTTON_COLORS)[number]
export type ButtonSize = (typeof BUTTON_SIZES)[number]

export const button = cva(
  [
    "font-poppins cursor-pointer appearance-none rounded-md transition-all",
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
      { color: "light", variant: "solid", className: "bg-slate-3 hover:bg-slate-4 disabled:hover:bg-slate-3" },
      { color: "light", variant: "pill", className: "bg-slate-3 hover:bg-slate-4 disabled:hover:bg-slate-3" },
      { color: "light", variant: "outline", className: "border-slate-5 hover:bg-slate-2 disabled:hover:bg-inherit" },
      { color: "light", variant: "text", className: "hover:bg-slate-3 disabled:hover:bg-inherit" },

      { color: "slate", variant: "solid", className: "bg-slate-5 hover:bg-slate-6 disabled:hover:bg-slate-5" },
      { color: "slate", variant: "pill", className: "bg-slate-5 hover:bg-slate-6 disabled:hover:bg-slate-5" },
      { color: "slate", variant: "outline", className: "border-slate-7 hover:bg-slate-3 disabled:hover:bg-inherit" },
      { color: "slate", variant: "text", className: "hover:bg-slate-3 disabled:hover:bg-inherit" },

      { color: "dark", variant: "solid", className: "bg-slate-11 hover:bg-slate-12 disabled:hover:bg-slate-11 text-white" },
      { color: "dark", variant: "pill", className: "bg-slate-11 hover:bg-slate-12 disabled:hover:bg-slate-11 text-white" },
      { color: "dark", variant: "outline", className: "border-slate-11 hover:bg-slate-11 disabled:hover:bg-inherit hover:text-white disabled:hover:text-inherit" },
      { color: "dark", variant: "text", className: "hover:bg-slate-11 disabled:hover:bg-inherit hover:text-white disabled:hover:text-inherit" },

      { color: "brand", variant: "solid", className: "bg-brand-9 hover:bg-brand-10 disabled:hover:bg-brand-9 text-white" },
      { color: "brand", variant: "pill", className: "bg-brand-9 hover:bg-brand-10 disabled:hover:bg-brand-9 text-white" },
      { color: "brand", variant: "outline", className: "border-brand-9 text-brand-9 hover:bg-brand-9 disabled:hover:bg-inherit hover:text-white disabled:hover:text-inherit" },
      { color: "brand", variant: "text", className: "text-brand-9 hover:bg-brand-3 disabled:hover:bg-inherit" },

      { color: "blue", variant: "solid", className: "bg-blue-9 hover:bg-blue-10 disabled:hover:bg-blue-9" },
      { color: "blue", variant: "pill", className: "bg-blue-9 hover:bg-blue-10 disabled:hover:bg-blue-9" },
      { color: "blue", variant: "outline", className: "border-blue-8 text-blue-11 hover:bg-blue-3 disabled:hover:bg-inherit" },
      { color: "blue", variant: "text", className: "text-blue-11 hover:bg-blue-3 disabled:hover:bg-inherit" },

      { color: "green", variant: "solid", className: "bg-green-9 hover:bg-green-10 disabled:hover:bg-green-9" },
      { color: "green", variant: "pill", className: "bg-green-9 hover:bg-green-10 disabled:hover:bg-green-9" },
      { color: "green", variant: "outline", className: "border-green-8 text-green-11 hover:bg-green-3 disabled:hover:bg-inherit" },
      { color: "green", variant: "text", className: "text-green-11 hover:bg-green-3 disabled:hover:bg-inherit" },

      { color: "red", variant: "solid", className: "bg-red-9 hover:bg-red-10 disabled:hover:bg-red-9" },
      { color: "red", variant: "pill", className: "bg-red-9 hover:bg-red-10 disabled:hover:bg-red-9" },
      { color: "red", variant: "outline", className: "border-red-8 text-red-11 hover:bg-red-3 disabled:hover:bg-inherit" },
      { color: "red", variant: "text", className: "text-red-11 hover:bg-red-3 disabled:hover:bg-inherit" },

      { color: "yellow", variant: "solid", className: "bg-yellow-9 hover:bg-yellow-10 disabled:hover:bg-yellow-9" },
      { color: "yellow", variant: "pill", className: "bg-yellow-9 hover:bg-yellow-10 disabled:hover:bg-yellow-9" },
      { color: "yellow", variant: "outline", className: "border-yellow-8 text-yellow-11 hover:bg-yellow-3 disabled:hover:bg-inherit" },
      { color: "yellow", variant: "text", className: "text-yellow-11 hover:bg-yellow-3 disabled:hover:bg-inherit" },
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
