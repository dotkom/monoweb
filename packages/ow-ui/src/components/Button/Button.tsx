import { cva } from "cva"
import type { VariantProps } from "cva"
import React, { forwardRef, HTMLProps, PropsWithChildren } from "react"
import { twMerge } from "tailwind-merge"

type Color = "blue" | "red" | "amber" | "slate" | "green" | undefined

export interface ButtonProps extends VariantProps<ReturnType<typeof buttonStyles>> {
  color?: Color
  icon?: React.ReactNode
  type?: "submit" | "reset" | "button"
  className?: string
  disabled?: boolean
}

export const Button = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps & HTMLProps<HTMLButtonElement>>>(
  (props, ref) => {
    const colorVariants = buttonStyles(props.color)
    return (
      <button
        {...props}
        className={twMerge(colorVariants({ disabled: !!props.disabled, variant: props.variant }), props.className)}
        type={props.type}
        ref={ref}
      >
        <div className="flex items-center justify-center">
          <i className="mr-1">{props.icon && props.icon}</i>
          <span className="text-inherit">{props.children}</span>
        </div>
      </button>
    )
  }
)

export const buttonStyles = (color: Color) =>
  cva(
    [
      "cursor-pointer appearance-none rounded-md border-none px-4 py-2 font-semibold",
      "focus:ring-2 focus:ring-slate-11 focus:outline-none",
      "transition-transform",
      "hover:-translate-y-[1px] active:translate-y-[2px]",
    ],
    {
      variants: {
        size: {
          sm: "text-sm px-3 h-9 font-medium",
          md: "text-md px-4 h-11 font-semibold",
          lg: "text-lg px-5 h-13 font-bold",
        },
        disabled: {
          true: "opacity-40 pointer-events-none cursor-not-allowed",
        },
        variant: {
          light: light({ color: color }),
          solid: solid({ color: color }),
          subtle: subtle({ color: color }),
          gradient: "bg-gradient-to-r from-[#0D5474] to-[#153E75] text-slate-12 ",
          brand: "bg-brand text-slate-12 hover:bg-brand-dark active:bg-brand-darker",
        },
      },
      defaultVariants: {
        variant: "brand",
        size: "md",
      },
    }
  )

const solid = cva("text-slate-12", {
  variants: {
    color: {
      blue: "bg-blue-9 hover:bg-blue-10",
      red: "bg-red-9 hover:bg-red-10",
      amber: "bg-amber-9 text-blue-1 hover:bg-amber-10",
      green: "bg-green-9 hover:bg-green-10",
      slate: "bg-slate-9 hover:bg-slate-10",
    },
  },
  defaultVariants: {
    color: "blue",
  },
})

const light = cva("", {
  variants: {
    color: {
      blue: "bg-blue-4 text-blue-11 hover:bg-blue-5",
      red: "bg-red-4 text-red-11 hover:bg-red-5",
      amber: "bg-amber-4 text-amber-11 hover:bg-amber-5",
      green: "bg-green-4 text-green-11 hover:bg-green-5",
      slate: "bg-slate-4 text-slate-11 hover:bg-slate-5",
    },
  },
  defaultVariants: {
    color: "blue",
  },
})

const subtle = cva("bg-transparent", {
  variants: {
    color: {
      blue: "text-blue-11 hover:bg-blue-2",
      red: "text-red-11 hover:bg-red-2",
      green: "text-green-11 hover:bg-green-2",
      amber: "text-amber-11 hover:bg-amber-2",
      slate: "text-slate-11 hover:bg-slate-2",
    },
  },
})
