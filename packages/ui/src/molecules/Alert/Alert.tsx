"use client"

import { cva } from "cva"
import type { FC, PropsWithChildren } from "react"
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
      <div className="text-black">{children}</div>
    </div>
  </div>
)

const alert = cva("flex justify-center flex-row px-5 py-4 rounded-md text-base", {
  variants: {
    status: {
      info: "bg-blue-300",
      success: "bg-green-300",
      warning: "bg-amber-300",
      danger: "bg-red-300",
    },
  },
})

const alertTitle = cva("font-semibold mb-3", {
  variants: {
    status: {
      info: "text-blue-950",
      success: "text-green-950",
      warning: "text-amber-950",
      danger: "text-red-950",
    },
  },
})
