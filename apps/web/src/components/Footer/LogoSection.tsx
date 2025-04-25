import { Text } from "@dotkomonline/ui"
import { OnlineLogo } from "../atoms/OnlineLogo"

export const LogoSection = () => (
  <div className="flex flex-col md:flex-row gap-8 md:gap-16 w-full md:items-end">
    <OnlineLogo className="h-12 w-fit" />
    <Text element="h2" className="text-xl">
      Linjeforeningen for informatikk ved NTNU
    </Text>
  </div>
)
