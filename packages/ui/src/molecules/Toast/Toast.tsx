"use client"

import { cva } from "cva"
import type { FC, PropsWithChildren } from "react"
import { Icon } from "../../atoms/Icon/Icon"
import { AlertIcon } from "../Alert/AlertIcon"

export type ToastProps = PropsWithChildren & {
  monochrome?: boolean
  status: "danger" | "info" | "success" | "warning"
}

export const Toast: FC<ToastProps> = ({ monochrome, status, children }) => {
  const styleCheck = monochrome ? "monochrome" : status
  return (
    <div className={base({ color: styleCheck })}>
      <div className="flex">
        <AlertIcon status={status} />
        {children}
      </div>
      {/* The monochrome value is inverted because we want a white or black icon with colored background*/}
      <button
        type="button"
        className="ml-auto border-0 bg-transparent transition-transform hover:-translate-y-[1px] active:translate-y-[2px]"
      >
        <Icon icon="tabler:x" aria-hidden className={close({ color: styleCheck })} width={24} />
      </button>
    </div>
  )
}

const base = cva("flex align-center p-2 rounded-sm max-w-[360px] text-slate-1 shadow-md", {
  variants: {
    color: {
      danger: "bg-red-9 text-slate-12",
      warning: "bg-amber-9",
      info: "bg-blue-9 text-slate-12",
      success: "bg-green-9 text-slate-12",
      monochrome: "bg-white",
    },
  },
})

const close = cva("w-6 h-6 text-slate-1", {
  variants: {
    color: {
      danger: "bg-red-9 text-slate-12",
      warning: "bg-amber-9",
      info: "bg-blue-9 text-slate-12",
      success: "bg-green-9 text-slate-12",
      monochrome: "",
    },
  },
})
