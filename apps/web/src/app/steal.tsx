"use client"
import { Button, Icon, Text, Title, cn } from "@dotkomonline/ui"
import type { FC } from "react"

export interface HeroProps {
  background: string
  banner: string
}

export const HeroData: HeroProps = {
  background: "bg-[url(/bakgrunnsBilde.jpg)]",
  banner: "./online-logo-darkmode.svg",
}

export const Hero: FC<HeroProps> = ({ background, banner }) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center py-16 md:py-32 text-white",
        "min-h-screen bg-no-repeat bg-cover bg-center",
        "rounded-2xl",
        background
      )}
    >
      <div className="max-w-screen px-8 md:px-16 mx-auto flex flex-col gap-12 md:gap-24 items-center mt-48 md:mt-0">
        <div className="flex flex-col w-full items-center justify-center gap-8 md:gap-16 drop-shadow-xl">
          <Title className="text-2xl md:text-4xl font-semibold tracking-wider">Fadderukene er i gang!</Title>

          <img src={banner} alt="Logo for Onlines fadderuker" className="sm:scale-75 drop-shadow-2xl" />

          <Title className="text-2xl md:text-4xl">Linjeforeningen for informatikkstudenter ved NTNU!</Title>
        </div>

        <Button
          className="w-fit text-2xl px-8 min-h-[5rem] rounded-xl bg-[#ffb564] hover:bg-[#ffce9d] gap-3"
          onClick={() => {
            document.getElementById("events-title")?.scrollIntoView({ behavior: "smooth", block: "start" })
          }}
          icon={<Icon icon="tabler:arrow-down" className="text-2xl" />}
        >
          Se informasjon om fadderukene
        </Button>
      </div>
    </div>
  )
}
