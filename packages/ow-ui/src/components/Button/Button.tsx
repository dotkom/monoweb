import { cva } from "cva"
import type { VariantProps } from "cva"
import { FC, PropsWithChildren } from "react"

import { styled } from "../../config/stitches.config"

export type ButtonProps = VariantProps<typeof button>

export const Button: FC<PropsWithChildren<ButtonProps>> = (props) => {
  return (
    <button className={button(props)}>
      <div className="flex">
        <span className="text-inherit">{props.children}</span>
      </div>
    </button>
  )
}

const button = cva("border-none rounded-md cursor-pointer px-4 py-2 appearance-none font-semibold", {
  variants: {
    color: {
      blue: "bg-blue-9 text-slate-12",
      red: "bg-red-9 text-slate-12",
      amber: "bg-amber-9 text-slate-1",
      green: "bg-green-9 text-slate-12",
      slate: "bg-slate-9 text-slate-12",
    },
    size: {},
    disabled: {
      true: "",
    },
    variant: {
      solid: "",
      light: "",
      subtle: "",
    },
  },
})

export const Button2 = styled("button", {
  border: "none",
  borderRadius: "$2",
  cursor: "pointer",
  px: "14px",
  py: "8px",
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-1px)",
    filter: "brightness(120%)",
  },
  "&:active": {
    transform: "translateY(2px)",
    filter: "brightness(130%)",
  },
  color: "$white",
  $$main: "$colors$blue3",
  $$secondary: "$colors$blue11",
  bg: "$$main",
  variants: {
    color: {
      blue: {
        $$main: "$colors$blue3",
        $$secondary: "$colors$blue11",
      },
      green: {
        $$main: "$colors$green3",
        $$secondary: "$colors$green11",
      },
      red: {
        $$main: "$colors$red3",
        $$secondary: "$colors$red11",
      },
      orange: {
        $$main: "$colors$orange3",
        $$secondary: "$colors$orange11",
      },
      gray: {
        $$main: "$colors$gray3",
        $$secondary: "$colors$gray11",
      },
      info: {
        $$main: "$colors$info3",
        $$secondary: "$colors$info11",
      },
    },
    variant: {
      solid: {
        color: "$white",
        bg: "$$main",
        "&:hover": { filter: "brightness(120%)" },
        "&:active": { filter: "brightness(130%)" },
      },
      light: {
        color: "$$main",
        bg: "$$secondary",
        "&:hover": { filter: "brightness(105%)" },
        "&:active": { filter: "brightness(110%)" },
      },
      subtle: {
        color: "$$main",
        bg: "transparent",
      },
    },
  },
  defaultVariants: {
    color: "blue",
    variant: "solid",
  },
})
