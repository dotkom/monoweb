import { Divider, ImageCard, Text, Title } from "@dotkomonline/ui"

export const OurGoalsCard = () => {
  return (
    <ImageCard image="/Hovedbygget-01.jpg" alt="Hovedbygget på NTNU" imagePosition="right" className="bg-yellow-100">
      <div className="flex flex-col items-center justify-center my-8 sm:my-24">
        <Title size={"xxl"} className="pb-1 font-extrabold">
          Vårt Mål
        </Title>
        <Divider className="w-2/3 sm:w-1/2 bg-yellow-300 h-3 rounded-full border-none" />
        <Text className="m-4 max-sm:text-center w-2/3">
          Online skal arbeide for å skape sterkere bånd mellom medlemmer på ulike årstrinn og være kontaktledd mellom
          medlemmene og eksterne aktører.
        </Text>
      </div>
    </ImageCard>
  )
}
