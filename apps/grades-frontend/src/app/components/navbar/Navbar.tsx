"use client"

import { cn, Title } from "@dotkomonline/ui"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CourseSearch } from "../CourseSearch"
import { LocalePopover } from "./LocalePopover"
import { MobileNavigation } from "./MobileNavigation"
import { ThemePopover } from "./ThemePopover"

export const Navbar = () => {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/90 backdrop-blur-md">
      <div className="flex h-16 w-full items-center justify-between max-w-screen-xl mx-auto px-4 lg:px-12 gap-8">
        <div className="flex items-center gap-8 w-full">
          <Link href="/">
            <Title className="text-2xl font-bold leading-none text-black">Grades</Title>
          </Link>

          <Link
            href="/emner"
            className={cn(
              "relative items-center rounded-lg px-3 py-1.5 text-[15px] font-medium transition-colors hidden sm:inline-flex",
              pathname === "/emner" ? "text-neutral-900" : "text-neutral-700 hover:text-neutral-900"
            )}
          >
            Emner
            {pathname === "/emner" && <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-black" />}
          </Link>

          <CourseSearch placeholder="Søk etter emner..." className="h-9 w-full max-w-lg" />
        </div>

        <div className="items-center gap-3 hidden sm:flex">
          <LocalePopover />
          <ThemePopover />
        </div>

        <MobileNavigation />
      </div>
    </header>
  )
}
