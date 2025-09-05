import { Text } from "@dotkomonline/ui"
import { OnlineLogo } from "../atoms/OnlineLogo"

export const LogoSection = () => (
  <div className="flex flex-col md:flex-row gap-4 md:gap-16 w-full md:items-end">
    <div className="aspect-[643/167] h-10 sm:h-12">
      <OnlineLogo style="brand" className="h-full dark:hidden" />
      <OnlineLogo style="black" className="h-full hidden dark:block" />
    </div>

    <Text element="h2" className="text-lg md:text-xl">
      Linjeforeningen for informatikk ved NTNU
    </Text>
  </div>
)
