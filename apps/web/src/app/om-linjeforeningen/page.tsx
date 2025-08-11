import { Divider, ImageCard, Text, Title } from "@dotkomonline/ui"
import Link from "next/link"

export default async function AboutOnlinePage() {
  return (
    <div className="flex flex-col gap-24">
      <WhoAreWeCard />
      <Statstics />
      <OurGoalsCard />
      <Structure />
    </div>
  )
}

const WhoAreWeCard = () => {
  return (
    <ImageCard image="/online-logo-o.svg" imagePosition="left" className="bg-blue-100 ">
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

const Statstics = () => {
  const memberCount = 600 // This would ideally be fetched from a service
  const activityCount = 2500 // This would ideally be fetched from a service
  const committeeCount = 30 // This would ideally be fetched from a service

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
      <Text className="mx-8">
        Linjeforeningen startet som en liten gruppe studenter høsten 1985, og har siden den gang vokst til å bli en av
        NTNU's større linjeforeninger innen teknologi, med over {memberCount} medlemmer. Foreningen drives av et stort
        antall frivillige som legger ned betydelig innsats for å skape et variert og engasjerende tilbud for medlemmene.
        Gjennom årene har Online arrangert mer enn {activityCount} aktiviteter inkludert faglige kurs,
        bedriftspresentasjoner og sosiale sammenkomster, som til sammen bidrar til å styrke både det faglige og det
        sosiale fellesskapet. Denne kombinasjonen av profesjonelle arrangementer og sosiale møteplasser har gjort Online
        til en sentral arena for kompetanseutvikling, nettverksbygging og trivsel blant medlemmene.
      </Text>
      <div className="flex flex-col sm:flex-row justify-around items-center gap-8">
        <StatisticsNumber number={memberCount} title="Aktive Medlemmer" />
        <StatisticsNumber number={activityCount} title="Arrangerte aktiviteter" />
        <StatisticsNumber number={committeeCount} title="Aktive komiteer" />
      </div>
    </>
  )
}

const OurGoalsCard = () => {
  return (
    <ImageCard image="/genfors-banner.jpeg" imagePosition="right" className="bg-yellow-100">
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

const Structure = () => {
  return (
    <div className="flex flex-col">
      <Title size={"xxl"} className="pb-1 font-extrabold">
        Struktur
      </Title>
      <Text className="mt-4">
        Generalforsamlingen utgjør den øverste besluttende myndighet i Online, og kan sammenlignes med et stortingsvalg
        for en ny regjering. Mellom generalforsamlingene ivaretas den daglige driften av linjeforeningen av hovedstyret
        og komiteene. Disse komiteene har spesifikke ansvarsområder, som spenner fra sosiale arrangementer til faglige
        kurs. Dette gir medlemmene muligheten til å engasjere seg i sine interessefelt, samtidig som det sikrer at
        foreningen kan tilby et variert spekter av aktiviteter og tjenester.
      </Text>
      <Text className="mt-4">
        Ønsker du å vite mer om hvordan Online er organisert, kan du lese mer på vår egen{" "}
        <Link href={"https://wiki.online.ntnu.no"} target="_blank" className="text-blue-900 underline">
          Online Wiki
        </Link>
      </Text>
    </div>
  )
}
