import { Text, Title } from "@dotkomonline/ui"
import Image from "next/image"
import Link from "next/link"

export const Structure = () => {
  return (
    <section className="flex flex-col">
      <Title size={"xxl"} className="pb-1 font-extrabold">
        Struktur
      </Title>
      <div className="flex flex-col gap-4 space-y-4">
        <Text>
          Generalforsamlingen utgjør den øverste besluttende myndighet i Online, og kan sammenlignes med et
          stortingsvalg for en ny regjering. Mellom generalforsamlingene ivaretas den daglige driften av linjeforeningen
          av hovedstyret og komiteene. Disse komiteene har spesifikke ansvarsområder, som spenner fra sosiale
          arrangementer til faglige kurs. Dette gir medlemmene muligheten til å engasjere seg i sine interessefelt,
          samtidig som det sikrer at foreningen kan tilby et variert spekter av aktiviteter og tjenester.
        </Text>
        <Text>
          Online har også tilknytning til flere andre grupper og organisasjoner som bidrar til å styrke miljøet rundt
          linjeforeningen. Disse samarbeidene kan være både sosiale og organisatoriske, og gir medlemmene flere
          muligheter for nettverksbygging, kompetanseutvikling og deltakelse i ulike arrangementer.
        </Text>
        <Text>
          Ønsker du å vite mer om hvordan Online er organisert og hvilke grupper vi samarbeider med, kan du lese mer på{" "}
          <Link href={"https://wiki.online.ntnu.no"} target="_blank" className="text-blue-900 underline">
            Online Wiki
          </Link>
        </Text>
        <>
          <Image
            src="/OnlineStruktur.png"
            alt="Online Organizational Structure map"
            width={0}
            height={0}
            className="w-full sm:w-1/2 self-center"
          />
          <Text className="text-center text-sm mt-2">Online Organisasjonskart</Text>
        </>
      </div>
    </section>
  )
}
