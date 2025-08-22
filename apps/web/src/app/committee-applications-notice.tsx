import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import { Button, Icon, Text, Title } from "@dotkomonline/ui"

export const CommitteeApplicationsNotice = () => {
  return (
    <Button
      element="a"
      href="opptak.online.ntnu.no"
      className="group flex flex-row justify-between w-full items-center p-5 min-h-24 bg-indigo-100 hover:bg-indigo-50 dark:bg-indigo-200 dark:text-black rounded-2xl"
    >
      <div className="flex flex-row gap-5 items-center">
        <div className="transform translate-y-[12.5%]">
          <OnlineIcon size={32} className="animate-bounce" />
        </div>

        <div className="flex flex-col gap-0.5">
          <Title className="text-lg md:text-xl font-bold">Søk komité nå!</Title>
          <Text>
            Komiteene har opptak, og de ser etter akkurat deg! <span className="font-semibold">Trykk her</span> for å gå
            til opptakssiden (opptak.online.ntnu.no).
          </Text>
        </div>
      </div>

      <Icon icon="tabler:arrow-up-right" className="text-2xl" />
    </Button>
  )
}
