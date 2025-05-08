import { type VariantProps, cva } from "cva"
import type { ComponentPropsWithRef, ElementType, PropsWithChildren, ReactNode } from "react"
import { cn } from "../../utils"

export const BUTTON_VARIANTS = ["solid", "outline"] as const
export const BUTTON_COLORS = ["brand", "gradient", "blue", "green", "red", "yellow"] as const
export const BUTTON_SIZES = ["sm", "md", "lg"] as const

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number]
export type ButtonColor = (typeof BUTTON_COLORS)[number]
export type ButtonSize = (typeof BUTTON_SIZES)[number]

export const button = cva(
  [
    "font-poppins",
    "cursor-pointer appearance-none rounded-md",
    "transition-all",
    "disabled:pointer-events-none disabled:opacity-40",
  ],
  {
    variants: {
      size: {
        sm: "text-sm px-3 py-1.5",
        md: "text-md px-3.5 py-2",
        lg: "text-lg px-4 py-2",
      },
      variant: {
        solid: "",
        outline: "border",
      },
      color: {
        brand: "",
        gradient: "",
        blue: "",
        green: "",
        red: "",
        yellow: "",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "solid",
      color: "brand",
    },
    compoundVariants: [
      // brand
      { color: "brand", variant: "solid", className: "bg-brand-9 hover:bg-brand-10 text-white" },
      { color: "brand", variant: "outline", className: "border-brand-9 text-brand-9 hover:bg-brand-2" },

      // gradient
      {
        color: "gradient",
        variant: "solid",
        className: "bg-gradient-to-r from-[#0D5474] to-[#153E75] text-white",
      },
      {
        color: "gradient",
        variant: "outline",
        className:
          "border-gradient-to-r from-[#0D5474] to-[#153E75] text-black hover:bg-gradient-to-r hover:from-[#0D5474]/10 hover:to-[#153E75]/10",
      },

      // blue
      { color: "blue", variant: "solid", className: "bg-blue-9 hover:bg-blue-10" },
      { color: "blue", variant: "outline", className: "border-blue-8 text-blue-11 hover:bg-blue-3" },

      // green
      { color: "green", variant: "solid", className: "bg-green-9 hover:bg-green-10" },
      { color: "green", variant: "outline", className: "border-green-8 text-green-12 hover:bg-green-3" },

      // red
      { color: "red", variant: "solid", className: "bg-red-9 hover:bg-red-10" },
      { color: "red", variant: "outline", className: "border-red-8 text-red-12 hover:bg-red-3" },

      // yellow
      { color: "yellow", variant: "solid", className: "bg-yellow-9 hover:bg-yellow-10" },
      { color: "yellow", variant: "outline", className: "border-yellow-8 text-yellow-12 hover:bg-yellow-3" },
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
