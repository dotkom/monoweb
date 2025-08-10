import { Text, Tilt, Title, cn } from "@dotkomonline/ui"
import Link from "next/link"

export const FadderukeNotice = () => {
  return (
    <Link href="https://splash.online.ntnu.no/" target="_blank" rel="noopener noreferrer">
      <Tilt tiltMaxAngleX={0.33} tiltMaxAngleY={0.33} scale={1.005} glareMaxOpacity={0.15}>
        <div
          className={cn(
            "flex flex-col pt-8 lg:pt-12 px-4 pb-4 justify-between md:gap-6 items-center rounded-2xl text-white shadow-inner",
            "bg-no-repeat bg-cover bg-center bg-[url(/fadderuke-2025-background.jpg)]",
            "h-72 lg:h-92 xl:h-[500px]"
          )}
        >
          <div className="flex flex-col text-orange-50 drop-shadow-lg">
            <Title
              element="p"
              className="font-bold text-4xl min-[27.5rem]:text-5xl sm:text-6xl lg:text-7xl xl:text-8xl w-full"
            >
              Fadderukene
            </Title>

            <Text className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-widest">2025</Text>
          </div>

          <Text
            className={cn(
              "bg-orange-200 text-orange-950 font-medium",
              "text-sm min-[27.5rem]:text-lg sm:text-xl md:text-2xl",
              "px-3 sm:px-5 py-2 sm:py-4 rounded-xl sm:rounded-2xl"
            )}
          >
            Trykk for å gå til programmet
          </Text>
        </div>
      </Tilt>
    </Link>
  )
}
