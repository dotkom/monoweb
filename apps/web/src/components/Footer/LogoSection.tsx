import { Text, Title } from "@dotkomonline/ui"
import { OnlineLogo } from "../atoms/OnlineLogo"
import Image from "next/image"

export const LogoSection = () => (
  <div className="flex flex-col gap-6 lg:gap-4 lg:flex-row lg:justify-between">
    <div className="flex flex-col md:flex-row gap-4 md:gap-16 w-full md:items-end">
      <OnlineLogo style="brand" className="h-10 sm:h-12 dark:hidden" />
      <OnlineLogo style="black" className="h-10 sm:h-12 hidden dark:block" />

      <Text element="h2" className="text-lg md:text-xl">
        Linjeforeningen for informatikk ved NTNU
      </Text>
    </div>

    <span className="lg:hidden h-1 w-full bg-field-border" />

    <div className="flex flex-col gap-1">
      <Title element="p" className="text-sm">
        I samarbeid med
      </Title>

      <Image
        src="/nito-light.svg"
        alt="NITO logo"
        width={220}
        height={50}
        className="h-7 w-fit lg:h-10 shrink-0 object-contain dark:hidden"
      />
      <Image
        aria-hidden
        src="/nito-dark.svg"
        alt="NITO logo"
        width={220}
        height={50}
        className="h-7 w-fit lg:h-10 shrink-0 object-contain not-dark:hidden"
      />
    </div>

    <span className="lg:hidden h-1 w-full bg-field-border" />
  </div>
)
