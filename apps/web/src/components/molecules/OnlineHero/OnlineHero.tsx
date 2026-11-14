"use client"

import { Button, Text, Title } from "@dotkomonline/ui"
import { IconArrowUpRight, IconBriefcase } from "@tabler/icons-react"
import { Link } from "@/components/link"
import type { FC } from "react"
import { Logo } from "./Logo"
import { OnlineHeroVisual } from "./OnlineHeroVisual"

export const OnlineHero: FC = () => {
  return (
    <div className="flex flex-col lg:justify-stretch pt-4 md:pt-10 lg:pt-0 gap-4 lg:gap-8 items-center lg:flex-row">
      <div className="flex flex-col gap-8 w-full max-w-[600px] mx-auto lg:mx-0 lg:order-2">
        <span aria-hidden="true" className="w-full max-w-[300px]">
          <Logo />
        </span>
        <Title size="xl" className="font-medium lg:text-3xl">
          Linjeforeningen for informatikk ved NTNU
        </Title>
        <div>
          <div className="flex flex-row gap-2 items-center">
            <IconBriefcase className="size-5" />
            <Text>Er du fra en bedrift og ønsker samarbeid?</Text>
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              variant="default"
              size="lg"
              element="a"
              href="/bedrift/interesse"
              iconRight={<IconArrowUpRight className="size-4" />}
            >
              Ta kontakt
            </Button>
            <Button color="gray" size="lg" element={Link} href="/om-linjeforeningen">
              Les mer om oss
            </Button>
          </div>
        </div>
      </div>

      <div className="relative w-full lg:-ml-8">
        <OnlineHeroVisual className="lg:mx-0" />
      </div>
    </div>
  )
}
