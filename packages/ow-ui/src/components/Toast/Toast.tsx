import { FC, ReactNode } from "react"
import { IoCloseOutline } from "react-icons/io5"

import { AlertIcon } from "../Alert/AlertIcon"
import { cva } from "cva"

export interface ToastProps {
  monochrome?: boolean
  status: "info" | "warning" | "success" | "danger"
  children: ReactNode
}

const Toast: FC<ToastProps> = ({ monochrome, status, children }) => {
  const styleCheck = monochrome ? "monochrome" : status
  return (
    <div className={base({ color: styleCheck })}>
      <div className="flex">
        <AlertIcon status={status}></AlertIcon>
        {children}
      </div>
      {/* The monochrome value is inverted because we want a white or black icon with colored background*/}

      <button className="ml-auto border-0 bg-transparent transition-transform hover:-translate-y-[1px] active:translate-y-[2px]">
        <IoCloseOutline aria-hidden className={close({ color: styleCheck })}></IoCloseOutline>
      </button>
    </div>
  )
}

const base = cva("flex align-center p-2 rounded max-w-[360px] text-slate-1 shadow-md", {
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

export default Toast
