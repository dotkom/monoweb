"use client"
import { OnlineLogo } from "@/components/atoms/OnlineLogo"
import { Text, Tilt, Title, cn } from "@dotkomonline/ui"
import Link from "next/link"

export const Hero = () => {
  return (
    <Link href="https://splash.online.ntnu.no/" target="_blank" rel="noopener noreferrer">
      <Tilt tiltMaxAngleX={0.33} tiltMaxAngleY={0.33} scale={1.005} glareMaxOpacity={0.15}>
        <div
          className={cn(
            "relative flex flex-col p-3 gap-3 md:gap-6 items-center rounded-2xl text-white shadow-inner",
            "bg-no-repeat bg-cover bg-top bg-[url(/bakgrunnsBilde.jpg)]",
            "h-72 lg:h-92 xl:h-[415px]"
          )}
        >
          <OnlineLogo
            style="black"
            className={cn("h-12 md:h-14 lg:h-14 p-3 bg-amber-900/5 w-fit rounded-lg drop-shadow-lg")}
          />

          <div className="absolute transform top-1/2 -translate-y-1/2 w-full text-center text-orange-50 drop-shadow-lg">
            <Title element="p" className="font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
              Fadderukene
            </Title>
            <Text className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-widest">2025</Text>
          </div>

          <div className="absolute bottom-4 md:bottom-6 lg:bottom-8 xl:bottom-10">
            <Text className="text-orange-100 text-base md:text-lg px-3 py-2 bg-amber-900/25 rounded-xl font-medium">
              Trykk for å gå til programmet
            </Text>
          </div>
        </div>
      </Tilt>
    </Link>
  )
}
