"use client"

import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@dotkomonline/ui"
import { IconCalendarPlus, IconDownload } from "@tabler/icons-react"
import Image from "next/image"
import { downloadIcsFile, openIcsFile } from "./ics"

interface AddToCalendarButtonProps {
  googleCalendarUrl: string
  ariaLabel: string
  icsBody: string
  icsFilename: string
  size?: "default" | "icon" | "icon-lg"
  label?: string
  variant?: "ghost" | "secondary"
  className?: string
}

export function AddToCalendarButton({
  googleCalendarUrl,
  ariaLabel,
  icsBody,
  icsFilename,
  size = "icon-lg",
  label,
  variant = "ghost",
  className,
}: AddToCalendarButtonProps) {
  const iconClassName = size === "icon-lg" ? "size-6" : "size-5"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className} aria-label={ariaLabel}>
          <IconCalendarPlus aria-hidden className={iconClassName} />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer">
            <Image src="/logo-google-calendar.svg" alt="" width={16} height={16} />
            Google Kalender
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            openIcsFile(icsBody)
          }}
        >
          <Image src="/logo-microsoft-outlook.svg" alt="Microsoft Outlook" width={16} height={16} />
          Outlook og Apple
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            downloadIcsFile(icsBody, icsFilename)
          }}
        >
          <IconDownload className="size-4" />
          Last ned .ics
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
