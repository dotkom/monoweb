import { Divider, ImageCard, Text, Title } from "@dotkomonline/ui"

export default async function AboutOnlinePage() {
  return (
    <div className="flex flex-col gap-24">
      <WhoAreWeCard />
      <Statstics />
      <OurGoalsCard />
    </div>
  )
}

const WhoAreWeCard = () => {
  return (
    <ImageCard image="/genfors-banner.jpeg" imagePosition="left" className="bg-blue-100 ">
      <div className="flex flex-col items-center justify-center my-8 sm:my-24">
        <Title size={"xxl"} className="pb-1 font-extrabold">
          Hvem er vi?
        </Title>
        <Divider className="w-2/3 sm:w-1/2 bg-blue-300 h-3 rounded-full " />
        <Text className="m-4 sm:w-2/3">
          Online er linjeforeningen for informatikkstudenter ved NTNU i Trondheim. Linjeforeningens oppgave er å
          forbedre studiemiljøet ved å fremme sosialt samvær, faglig kompetanse og kontakt med næringslivet.
        </Text>
      </div>
    </ImageCard>
  )
}

const Statstics = () => {
  const StatisticsNumber = ({ number, title }: { number: number; title: string }) => {
    return (
      <div className="flex flex-col items-center">
        <Text className="text-5xl font-extrabold">{number}+</Text>
        <Text className="text-md">{title}</Text>
      </div>
    )
  }
  return (
    <>
      <Text>
        Linjeforeningen startet som en liten gruppe studenter høsten 1985, og har siden den gang vokst til å bli en av
        NTNU's største linjeforeninger, med over 1 000 medlemmer. Foreningen drives av et stort antall frivillige som
        legger ned betydelig innsats for å skape et variert og engasjerende tilbud for medlemmene. Gjennom årene har
        Online arrangert mer enn 2 000 aktiviteter inkludert faglige kurs, bedriftspresentasjoner og sosiale
        sammenkomster, som til sammen bidrar til å styrke både det faglige og det sosiale fellesskapet. Denne
        kombinasjonen av profesjonelle arrangementer og sosiale møteplasser har gjort Online til en sentral arena for
        kompetanseutvikling, nettverksbygging og trivsel blant medlemmene.
      </Text>
      <div className="flex flex-col sm:flex-row justify-around items-center gap-6">
        <StatisticsNumber number={600} title="Aktive Medlemmer" />
        <StatisticsNumber number={2000} title="Arrangerte aktiviteter" />
        <StatisticsNumber number={30} title="Aktive komiteer" />
      </div>
    </>
  )
}

const OurGoalsCard = () => {
  return (
    <ImageCard image="/genfors-banner.jpeg" imagePosition="right" className="bg-yellow-100">
      <div className="flex flex-col items-center justify-center my-8 sm:my-24">
        <Title size={"xxl"} className="pb-1 font-extrabold">
          Våre Mål
        </Title>
        <Divider className="w-2/3 sm:w-1/2 bg-yellow-300 h-3 rounded-full" />
        <Text className="mt-4 w-2/3">
          Online skal arbeide for å skape sterkere bånd mellom medlemmer på ulike årstrinn og være kontaktledd mellom
          medlemmene og eksterne aktører.
        </Text>
      </div>
    </ImageCard>
  )
}
