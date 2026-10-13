"use client"

import { Link } from "@/components/link"
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuTrigger,
  Text,
  Title,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@dotkomonline/ui"
import { IconArrowUpRight, IconMessageReport } from "@tabler/icons-react"
import type { FC } from "react"
import { GroupLogo } from "../atoms/GroupLogo"
import { NavbarDropdownContent } from "./NavbarDropdownContent"

const DEBUG_CONTACT_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScvjEqVsiRIYnVqCNqbH_-nmYk3Ux6la8a7KZzsY3sJDbW-iA/viewform"

export const ContactDebugDropdown: FC = () => (
  <DropdownMenu>
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <DropdownMenuTrigger
          render={
            <Button
              variant="unstyled"
              aria-label="Kontakt debug, les mer om debug"
              className={cn(
                "transition-colors",
                "flex items-center justify-center size-10 rounded-full",
                "hover:bg-gray-200 dark:hover:bg-stone-700/50"
              )}
            >
              <IconMessageReport className="size-6" strokeWidth={1.6} />
            </Button>
          }
        />
      </TooltipTrigger>
      <TooltipContent>Opplevd noe ugreit?</TooltipContent>
    </Tooltip>

    <NavbarDropdownContent className="w-[calc(100vw-2rem)] xs:w-90 p-3 bg-background border border-gray-300/70 dark:border-stone-700 rounded-3xl shadow-md">
      <div className="flex flex-col gap-3">
        <Title size="md" element="h3" className="px-3 pt-1.5 max-sm:hidden">
          Har du opplevd noe ugreit?
        </Title>
        <Title size="md" element="h3" className="px-3 pt-1.5 sm:hidden">
          Opplevd noe ugreit?
        </Title>

        <Link
          href="/grupper/debug"
          className={cn(
            "flex flex-row items-center gap-3 p-3 pl-1 rounded-xl transition-colors",
            "hover:bg-gray-50 dark:hover:bg-stone-700/25",
            "border border-transparent hover:border-gray-200 dark:hover:border-stone-700"
          )}
        >
          <GroupLogo
            src="/debug-logo.png"
            alt="Debug"
            width={42}
            height={42}
            containerClassName="rounded-full p-1.25"
          />

          <div className="flex flex-col gap-0">
            <Title element="p" size="md">
              Debug
            </Title>

            <Text className="text-sm text-muted-foreground">Onlines uavhengige varslingsorgan</Text>
          </div>
        </Link>

        <Text className="px-3 text-sm">
          Alle Debug-medlemmer har taushetsplikt, og alle innsendelser blir håndtert konfidensielt uten innsyn fra
          ledelsen i Online.
        </Text>

        <div className="flex flex-col gap-2 mt-3">
          <Button
            element={Link}
            variant="default"
            size="xl"
            href={DEBUG_CONTACT_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Text element="span">Ta kontakt med Debug</Text>
            <IconArrowUpRight className="size-5" />
          </Button>

          <Button
            element={Link}
            variant="ghost"
            href="/grupper/debug"
            className="w-fit hover:bg-gray-200 dark:hover:bg-stone-700"
          >
            Les mer om Debug
            <IconArrowUpRight className="size-4" />
          </Button>
        </div>
      </div>
    </NavbarDropdownContent>
  </DropdownMenu>
)
