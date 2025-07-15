import { Text, Title } from "@dotkomonline/ui"
import type { FC } from "react"
import type { HeroProps } from "../data/hero"

export const Hero: FC<HeroProps> = ({ background, banner }) => {
  return (
    <div
      className={`${background} h-screen bg-no-repeat bg-cover bg-center max-md:p-16 p-32 flex flex-col justify-center items-center text-white`}
    >
      <img src={banner} alt="Logo for Online's fadderuker" className="scale-75" />
      <Title className="max-md:text-2xl text-4xl mb-5 text-center">
        Velkommen til Online, linjeforeningen for informatikkstudenter ved NTNU!
      </Title>
      <Text className="text-center md:text-lg">
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
  )
}
