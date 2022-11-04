import { TablerIcon } from "@tabler/icons"
import clsx from "clsx"
import { cva } from "cva"
import type { VariantProps } from "cva"
import React, { FC, forwardRef, HTMLProps, PropsWithChildren } from "react"

import { styled } from "../../config/stitches.config"

type Color = "blue" | "red" | "amber" | "slate" | "green" | undefined
interface ButtonProps extends VariantProps<ReturnType<typeof defaultButton>> {
  color: Color
  icon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps>>((props, ref) => {
  const colorVariants = defaultButton(props.color)
  return (
    <button
      className={clsx(
        "cursor-pointer appearance-none rounded-md border-none px-4 py-2 font-semibold",
        "transition-transform",
        "hover:-translate-y-[1px] active:translate-y-[2px]",
        colorVariants(props)
      )}
      {...props}
      ref={ref}
    >
      <div className="flex items-center">
        <i className="mr-1">{props.icon && props.icon}</i>
        <span className="text-inherit">{props.children}</span>
      </div>
    </button>
  )
})

const defaultButton = (color: Color) =>
  cva("", {
    variants: {
      size: {},
      nonInteractive: {
        true: "opacity-40 pointer-events-none cursor-not-allowed",
      },
      variant: {
        light: light({ color: color }),
        solid: solid({ color: color }),
      },
    },
  })

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
