"use client"

import { alertClasses, alertTitleClasses } from "#lib/colors"
import { cva } from "cva"
import type { FC, PropsWithChildren, ReactNode } from "react"
import { cn } from "../../utils"
import { AlertIcon } from "./AlertIcon"

export interface AlertProps {
  status: "danger" | "info" | "success" | "warning"
  title: ReactNode
  showIcon?: boolean
  icon?: ReactNode
  className?: string
}

export const Alert: FC<PropsWithChildren<AlertProps>> = ({
  status,
  title,
  children,
  icon,
  showIcon = true,
  className,
}) => (
  <div className={cn(alertBase(), alertClasses(status), className)}>
    <div className="mr-3">{showIcon && (icon ?? <AlertIcon status={status} />)}</div>
    <div className="flex flex-col">
      <span className={cn(alertTitleBase(), alertTitleClasses(status))}>{title}</span>
      <div className="text-foreground/90">{children}</div>
    </div>
  </div>
)

const alertBase = cva("flex flex-row rounded-lg px-5 py-4 text-base")

const alertTitleBase = cva("mb-3 font-semibold")
