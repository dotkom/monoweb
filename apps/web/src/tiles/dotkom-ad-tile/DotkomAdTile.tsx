import React, { HTMLAttributes } from "react"

export function DotkomAdTile(props: HTMLAttributes<HTMLDivElement>) {
  return <div
      className="bg-[#031024] rounded-2xl col-span-1 h-[400px] flex items-center flex-col justify-center"
      {...props}
    >
    <img src="dotkom.png" alt="dotkom" className="px-8" />
    <h2 className="text-white my-2">Søk&nbsp;Dotkom!</h2>
    <p className="text-white text-center w-full p-4">
      Vil du være med å lage nettsiden vår? Søk dotkom og bli med i gjengen som lager nettsiden vår!
    </p>
  </div>
}