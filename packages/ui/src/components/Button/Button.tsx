import { cva } from "cva"
import type { VariantProps } from "cva"
import type { ComponentPropsWithRef, ElementType, PropsWithChildren, ReactNode } from "react"
import { cn } from "../../utils"

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

export const button = cva(
  [
    "disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-40",
    "cursor-pointer appearance-none rounded-md",
    "focus:ring-2 focus:ring-blue-9 focus:outline-none",
    "transition-transform duration-150",
    "hover:-translate-y-[1px] active:translate-y-[2px]",
  ],
  {
    variants: {
      size: {
        sm: "text-sm px-2 h-8 font-medium",
        md: "text-md px-4 h-10 font-semibold",
        lg: "text-lg px-6 h-12 font-bold",
      },
      variant: {
        outline: "!bg-transparent border-2 !text-black",
        solid: "text-slate-12",
      },
      color: {
        brand: "bg-brand-9 hover:bg-brand-10",
        gradient: "bg-gradient-to-r from-[#0D5474] to-[#153E75]",
        amber: "bg-amber-9 hover:bg-amber-10",
        blue: "bg-blue-9 hover:bg-blue-10",
        green: "bg-green-9 hover:bg-green-10",
        red: "bg-red-9 hover:bg-red-10",
        indigo: "bg-indigo-9 hover:bg-indigo-10",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
      color: "brand",
    },
    compoundVariants: [
      // Compounds for edge-cases contrast colors
      {
        color: "brand",
        variant: "solid",
        className: "text-white",
      },
      {
        color: "gradient",
        variant: "solid",
        className: "text-white",
      },
      // Compounds for outline+all colors
      {
        color: "brand",
        variant: "outline",
        className: "!border-brand-9 hover:border-brand-10",
      },
      {
        color: "gradient",
        variant: "outline",
        className: "!border-gradient-to-r text-black !bg-none",
      },
      {
        color: "amber",
        variant: "outline",
        className: "!border-amber-9 hover:border-amber-10",
      },
      {
        color: "blue",
        variant: "outline",
        className: "!border-blue-9 hover:border-blue-10",
      },
      {
        color: "green",
        variant: "outline",
        className: "!border-green-9 hover:border-green-10",
      },
      {
        color: "red",
        variant: "outline",
        className: "!border-red-9 hover:border-red-10",
      },
      {
        color: "indigo",
        variant: "outline",
        className: "!border-indigo-9 hover:border-indigo-10",
      },
    ],
  }
)
