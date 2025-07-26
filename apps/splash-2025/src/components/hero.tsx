import { Text, Title, cn } from "@dotkomonline/ui"
import type { FC } from "react"
import type { HeroProps } from "../data/hero"

export const Hero: FC<HeroProps> = ({ background, banner }) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center py-16 md:py-32 text-white",
        "h-screen bg-no-repeat bg-cover bg-center",
        background
      )}
    >
      <div className="max-w-screen-xl px-8 md:px-16 mx-auto flex flex-col gap-24 items-center mt-48 md:mt-0">
        <div className="flex flex-col w-full items-center justify-center gap-16 drop-shadow-xl">
          <Title className="text-2xl md:text-4xl mx-auto uppercase font-bold tracking-wider">Velkommen til</Title>

          <img src={banner} alt="Logo for Onlines fadderuker" className="scale-75 drop-shadow-2xl" />

          <Title className="text-2xl md:text-4xl">Linjeforeningen for informatikkstudenter ved NTNU!</Title>
        </div>

        <Text className="text-base md:text-2xl">
          Det er vi som sørger for at studietiden blir den beste tiden i ditt liv! Vi i Online arrangerer utflukter,
          turer, fester, holder kurs og bedriftspresentasjoner gjennom hele året.
          <br />
          Ny på master? Se{" "}
          <a href="https://online.ntnu.no" className="underline text-brand-700">
            viktig info om IT-ekskursjonen
          </a>{" "}
          OBS - kort frist!
        </Text>
      </div>
    </div>
  )
}
