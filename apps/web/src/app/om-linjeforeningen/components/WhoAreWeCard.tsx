import { Divider, ImageCard, Text, Title } from "@dotkomonline/ui"

export const WhoAreWeCard = () => {
  return (
    <ImageCard image="/online-logo-o.svg" alt="Online logo" imagePosition="left" className="bg-blue-100">
      <div className="flex flex-col items-center justify-center my-8 sm:my-24">
        <Title size={"xxl"} className="pb-1 font-extrabold">
          Hvem er vi?
        </Title>
        <Divider className="w-2/3 sm:w-1/2 bg-blue-300 h-3 rounded-full border-none " />
        <Text className="m-4 max-sm:text-center sm:w-2/3">
          Online er linjeforeningen for informatikkstudenter ved NTNU i Trondheim. Linjeforeningens oppgave er å
          forbedre studiemiljøet ved å fremme sosialt samvær, faglig kompetanse og kontakt med næringslivet.
        </Text>
      </div>
    </ImageCard>
  )
}
