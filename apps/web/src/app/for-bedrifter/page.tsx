import { BedpressIcon } from "@/components/icons/BedpressIcon"
import { ItexIcon } from "@/components/icons/ItexIcon"
import { OfflineIcon } from "@/components/icons/OfflineIcon"
import { UtlysningIcon } from "@/components/icons/UtlysningIcon"
import { Button, Circle, Text, Title } from "@dotkomonline/ui"
import { type FC, Fragment } from "react"
import './index.css';


export default async function Page() {
  return (
    <main className="flex flex-col gap-16 items-center">
      <HeroSection />
      <InterestSection />
      <ProductSection />
      <ProcessSection />
      <OfferSection />
      <ContactSection />
    </main>
  )
}

const HeroSection: FC = () => {
  return (
    <section className="bg-amber-100 text-black w-full rounded-lg">
      <div className="mx-auto flex max-w-[768px] flex-col text-center items-center p-4 pb-9">
        <Title element="h1" className="mb-8 mt-5 !text-4xl/relaxed lg:!text-5xl/tight">
          Er din bedrift på jakt etter skarpe <br />
          <span className="relative after:content-[''] after:bg-amber-600  after:rounded-full after:absolute after:left-0 after:-bottom-4 after:w-full after:h-4">
            IT&ndash;studenter?
          </span>
        </Title>
        <Text>
          Online er en linjeforening for Informatikkstudentene ved NTNU Gløshaugen. Informatikkstudiet hører til
          Institutt for datateknologi og informatikk (IDI). Dette innebærer blant annet å lære om utvikling, forbedring,
          evaluering og bruk av datasystemer. For mer informasjon om studiet, se NTNU sine offisielle nettsider for
          bachelor og master.
        </Text>
      </div>
    </section>
  )
}

const InterestSection: FC = () => {
  return (
    <section className="flex flex-col items-center text-center">
      <Title size="lg" className="mb-4">
        Bruk Onlines interesseskjema for å melde interesse
      </Title>
      <Text size="sm">
        Bedriftens svar vil bli sendt til Onlines bedriftskomite og etterstrebes å bli svart på innen to virkedager.
      </Text>

      <a href="https://interesse.online.ntnu.no" className="mt-4">
        <Button>Send Interesse</Button>
      </a>
    </section>
  )
}

const ProductSection: FC = () => {
  const products = [
    {
      name: "ITEX",
      icon: ItexIcon,
    },
    {
      name: "Bedriftsarrangement",
      icon: BedpressIcon,
    },
    {
      name: "Stillingsutlysning",
      icon: UtlysningIcon,
    },
    {
      name: "Annonse i Offline",
      icon: OfflineIcon,
    },
  ]
  return (
    <>
      <section className="max-w-4xl text-center">
        <Title className="mb-4">Våre Produkter</Title>
        <Text>
          I samarbeid med næringslivet tilbyr vi forskjellige produkter for å gi studentene våre en bredere og dypere
          fagkunnskap samt et innblikk i hverdagen til aktuelle arbeidsplasser.
        </Text>
      </section>
      <section className="columns-2 max-w-4xl md:flex md:justify-evenly md:gap-20">
        {products.map((product) => (
          <div key={product.name} className="flex flex-col pb-8 items-center text-brand-lighter">
            <product.icon className="h-[50px] lg:h-[100px]" fill="currentColor" stroke="currentColor" />
            <Text className="font-bold text-current">{product.name}</Text>
          </div>
        ))}
      </section>
    </>
  )
}

const ProcessSection: FC = () => {
  const steps = ["Kartlegging", "Intern Planlegging", "Tilbud", "Samarbeid"]
  return (
    <section className="bg-blue-200 w-full py-10 rounded-lg ">
      <div className="mx-auto flex flex-col items-center md:flex-wrap md:flex-row md:items-stretch justify-evenly max-w-[1024px] px-16 py-4 lg:flex-nowrap ">
        {steps.map((step, index) => (
          <Fragment key={step}>
            <div className="mb-1 w-36 flex flex-col items-center z-10 py-3">
              <Circle size={700 / 15} color="bg-brand-lighter">
                <span className="text-black font-bold text-background">{index + 1}</span>
              </Circle>
              <span className="text-black text-center text-xl font-semibold mt-9 md:mt-14">{step}</span>
            </div>
            {index !== steps.length - 1 && (
              <svg
                width="171"
                height="85"
                viewBox="0 0 165 33"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`${index % 2 === 0 ? "rotate-180 mt-6" : "-mt-10"} -mr-10 -ml-10 hidden lg:block`}
              >
                <title>Hva som skjer etter du har sendt din interesse</title>
                <path
                  d="M1 32L14.2545 25.4507C40.8415 12.3136 54.1349 5.74505 68.0752 3.24369C79.9121 1.11974 92.0351 1.14832 103.862 3.32806C117.79 5.89513 131.053 12.5263 157.577 25.7886L170 32"
                  stroke="#153E75"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  strokeDashoffset="0"
                  className={index % 2 === 0 ? "animate-dash-backward" : "animate-dash-forward"}
                  />
              </svg>
            )}
          </Fragment>
        ))}
      </div>
    </section>
  )
}

const OfferSection: FC = () => {
  return (
    <>
      <section className="max-w-4xl">
        <Title className="mb-4">Stillingsutlysning</Title>
        <Text>
          Vi har en{" "}
          <a href="/karriere" className="underline">
            karriereside
          </a>{" "}
          på våre nettsider der vi legger ut stillingsannonser for bedrifter som ønsker det. Send en mail til
          bedriftskontakt@online.ntnu.no eller fyll ut interesseskjema om en annonse skulle være av interesse.
        </Text>
      </section>

      <section className="max-w-4xl">
        <Title className="mb-4">Annonse i Offline</Title>
        <Text>
          Offline er linjeforeningsmagasinet til Online. Offline blir lest av våre studenter og i tillegg sendt ut til
          bedrifter. Som bedrift får dere tilbud om spalte, helsides eller halvsides annonse. Annonsen kan inneholde det
          dere selv ønsker alt etter hvordan dere ønsker å profilere dere.
        </Text>
      </section>

      <section className="max-w-4xl">
        <Title className="mb-4">ITEX</Title>
        <Text>
          I månedsskifte august/september arrangeres den årlige IT-ekskursjonen til Oslo for masterstudenter på
          informatikk. Formålet er å reise på besøk til spennende og aktuelle IT-bedrifter for å få bedre kjennskap og
          forhold til potensielle arbeidsgivere.
        </Text>
        <p>Vi begynner å kontakte aktuelle bedrifter for ITEX på vårsemesteret.</p>
      </section>
    </>
  )
}

const ContactSection: FC = () => {
  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center text-center text-sm p-4">
      <Title size="md" element="h3">
        Lyst til å høre mer?
      </Title>
      <Text>
        Onlines bedriftskomite hjelper deg gjerne med alle spørsmål du måtte ha. E-posten etterstrebes å bli svart på
        innen to virkedager.
      </Text>
      <Text>
        E-post:{" "}
        <a className="underline" href="mailto:bedriftskontakt@online.ntnu.no">
          bedriftskontakt@online.ntnu.no
        </a>
      </Text>
    </div>
  )
}
