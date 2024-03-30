"use client";

import { cva } from "cva"
import { type FC, type PropsWithChildren } from "react"
import { AlertIcon } from "./AlertIcon"

export interface AlertProps {
  status: "danger" | "info" | "success" | "warning"
  title: string
  showIcon?: boolean
}

export const Alert: FC<PropsWithChildren<AlertProps>> = ({ status, title, children, showIcon = true }) => (
  <div className={alert({ status })}>
    <div className="mr-3">{showIcon && <AlertIcon status={status} />}</div>
    <div className="flex flex-col">
      <span className={alertTitle({ status })}>{title}</span>
      <div className="text-slate-12">{children}</div>
    </div>
  </div>
)

const alert = cva("flex justify-center flex-row px-5 py-4 rounded-md text-base", {
  variants: {
    status: {
      info: "bg-blue-4",
      success: "bg-green-4",
      warning: "bg-amber-4",
      danger: "bg-red-4",
    },
  },
})

const alertTitle = cva("font-semibold mb-3", {
  variants: {
    status: {
      info: "text-blue-11",
      success: "text-green-11",
      warning: "text-amber-11",
      danger: "text-red-11",
    },
  },
})
