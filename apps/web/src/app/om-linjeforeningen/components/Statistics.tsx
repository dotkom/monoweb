import { Text } from "@dotkomonline/ui"

export const Statistics = async () => {
  const memberCount = roundToLowestN(600, 50) // This could be fetched from the server, but stays relatively constant
  const hobbyGroups = roundToLowestN(30, 5) // This could also be fetched from the server, but does not change as often
  const eventCount = roundToLowestN(2500, 50) // Fetching the event count from the server

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
        Gjennom årene har Online arrangert mer enn {eventCount} aktiviteter inkludert faglige kurs,
        bedriftspresentasjoner og sosiale sammenkomster, som til sammen bidrar til å styrke både det faglige og det
        sosiale fellesskapet. Denne kombinasjonen av profesjonelle arrangementer og sosiale møteplasser har gjort Online
        til en sentral arena for kompetanseutvikling, nettverksbygging og trivsel blant medlemmene.
      </Text>
      <div className="flex flex-col sm:flex-row justify-around items-center gap-8">
        <StatisticsNumber number={memberCount} title="Aktive Medlemmer" />
        <StatisticsNumber number={eventCount} title="Arrangerte aktiviteter" />
        <StatisticsNumber number={hobbyGroups} title="Interessegrupper" />
      </div>
    </>
  )
}

const roundToLowestN = (num: number, n: number) => {
  return Math.floor(num / n) * n
}
