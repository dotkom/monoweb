"use client"

import { cva } from "cva"
import type { FC, PropsWithChildren } from "react"
import { alertClasses, alertTitleClasses } from "#lib/colors"
import { cn } from "../../utils"
import { AlertIcon } from "./AlertIcon"

export interface AlertProps {
  status: "danger" | "info" | "success" | "warning"
  title: string
  showIcon?: boolean
}

export const Alert: FC<PropsWithChildren<AlertProps>> = ({ status, title, children, showIcon = true }) => (
  <div className={cn(alertBase(), alertClasses(status))}>
    <div className="mr-3">{showIcon && <AlertIcon status={status} />}</div>
    <div className="flex flex-col">
      <span className={cn(alertTitleBase(), alertTitleClasses(status))}>{title}</span>
      <div className="text-foreground/90">{children}</div>
    </div>
  </div>
)

const alertBase = cva("flex flex-row rounded-lg px-5 py-4 text-base")

const alertTitleBase = cva("mb-3 font-semibold")
