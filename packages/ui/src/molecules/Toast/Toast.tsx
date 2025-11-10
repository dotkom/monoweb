"use client"

import { IconX } from "@tabler/icons-react"
import { cva } from "cva"
import type { FC, PropsWithChildren } from "react"
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
        <IconX aria-hidden className={close({ color: styleCheck })} size={24} />
      </button>
    </div>
  )
}

const base = cva("flex align-center p-2 rounded-sm max-w-[360px] text-slate-50 shadow-md", {
  variants: {
    color: {
      danger: "bg-red-800 text-black",
      warning: "bg-amber-800",
      info: "bg-blue-800 text-black",
      success: "bg-green-800 text-black",
      monochrome: "bg-white",
    },
  },
})

const close = cva("w-6 h-6 text-slate-50", {
  variants: {
    color: {
      danger: "bg-red-800 text-black",
      warning: "bg-amber-800",
      info: "bg-blue-800 text-black",
      success: "bg-green-800 text-black",
      monochrome: "",
    },
  },
})
