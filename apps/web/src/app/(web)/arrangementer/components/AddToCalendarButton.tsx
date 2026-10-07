"use client"

import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@dotkomonline/ui"
import { IconChevronDown, IconDownload } from "@tabler/icons-react"
import Image from "next/image"
import { downloadIcsFile, openIcsFile } from "./ics"

interface AddToCalendarButtonProps {
  googleCalendarUrl: string
  googleCalendarAriaLabel: string
  icsBody: string
  icsFilename: string
}

export function AddToCalendarButton({
  googleCalendarUrl,
  googleCalendarAriaLabel,
  icsBody,
  icsFilename,
}: AddToCalendarButtonProps) {
  return (
    <div className="inline-flex">
      <Button
        element="a"
        href={googleCalendarUrl}
        target="_blank"
        rel="noopener noreferrer"
        variant="outline"
        size="icon-lg"
        aria-label={googleCalendarAriaLabel}
        className="rounded-r-none"
      >
        <Image src="/logo-google-calendar.svg" alt="Google Calendar" width={16} height={16} />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" aria-label="Flere kalendervalg" className="h-9 w-5 rounded-l-none border-l-0 px-0">
            <IconChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
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
    </div>
  )
}
