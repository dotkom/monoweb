import { Button } from "@dotkomonline/ui"
import CompanyInterestProcess from "./CompanyInterestProcess"
import OurProducts from "./OurProducts"

export const CompanyInfoView = () => {
  return (
    <div className="flex flex-col gap-14 items-center mb-7">
      <div className="bg-amber-2 w-full rounded-lg">
        <div className="mx-auto flex max-w-[768px] flex-col text-center items-center p-4 pb-9">
          <div className="font-fraunces font-extrabold mb-8 mt-5 text-4xl/relaxed lg:text-5xl/tight">
            Er din bedrift på jakt etter skarpe <br />
            <span className="relative after:content-[''] after:bg-amber-7 after:rounded-full after:absolute after:left-0 after:-bottom-4 after:w-full after:h-4">
              IT&ndash;studenter?
            </span>
          </div>
          <p>
            Online er en linjeforening for Informatikkstudentene ved NTNU Gløshaugen. Informatikkstudiet hører til
            Institutt for datateknologi og informatikk (IDI). Dette innebærer blant annet å lære om utvikling,
            forbedring, evaluering og bruk av datasystemer. For mer informasjon om studiet, se NTNU sine offisielle
            nettsider for bachelor og master.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center px-3 text-center ">
        <h2 className="mb-4">Bruk Onlines interesseskjema for å melde interesse</h2>
        <p className="text-sm">
          Bedriftens svar vil bli sendt til Onlines bedriftskomite og etterstrebes å bli svart på innen to virkedager.
        </p>
        <a href="https://interesse.online.ntnu.no" className="mt-4">
          <Button>Send Interesse</Button>
        </a>
      </div>

      <div className="max-w-4xl text-center">
        <h2 className="mb-4">Våre Produkter</h2>
        <p>
          I samarbeid med næringslivet tilbyr vi forskjellige produkter for å gi studentene våre en bredere og dypere
          fagkunnskap samt et innblikk i hverdagen til aktuelle arbeidsplasser.
        </p>
      </div>

      <OurProducts />

      <div className="bg-blue-3 w-full py-10 rounded-lg">
        <CompanyInterestProcess steps={["Kartlegging", "Intern Planlegging", "Tilbud", "Sammarbeid"]} />
      </div>

      <div className="max-w-4xl">
        <h2 className="mb-4">Stillingsutlysning</h2>
        <p>
          Vi har en{" "}
          <a href="/career" className="underline">
            karriereside
          </a>{" "}
          på våre nettsider der vi legger ut stillingsannonser for bedrifter som ønsker det. Send en mail til
          bedriftskontakt@online.ntnu.no eller fyll ut interesseskjema om en annonse skulle være av interesse.
        </p>
      </div>

      <div className="max-w-4xl">
        <h2 className="mb-4">Annonse i Offline</h2>
        <p>
          Offline er linjeforeningsmagasinet til Online. Offline blir lest av våre studenter og i tillegg sendt ut til
          bedrifter. Som bedrift får dere tilbud om spalte, helsides eller halvsides annonse. Annonsen kan inneholde det
          dere selv ønsker alt etter hvordan dere ønsker å profilere dere.
        </p>
      </div>

      <div className="max-w-4xl">
        <h2 className="mb-4">ITEX</h2>
        <p>
          I månedsskifte august/september arrangeres den årlige IT-ekskursjonen til Oslo for masterstudenter på
          informatikk. Formålet er å reise på besøk til spennende og aktuelle IT-bedrifter for å få bedre kjennskap og
          forhold til potensielle arbeidsgivere.
        </p>
        <p>Vi begynner å kontakte aktuelle bedrifter for ITEX på vårsemesteret.</p>
      </div>

      <div className="max-w-3xl mx-auto flex flex-col items-center text-center text-sm p-4">
        <h3>Lyst til å høre mer?</h3>
        <p>
          Onlines bedriftstskomite hjelper deg gjerne med alle spørsmål du måtte ha. E-posten etterstrebes å bli svart
          på innen to virkedager.
        </p>
        <p>
          E-post:{" "}
          <a className="underline" href="mailto:bedriftskontakt@online.ntnu.no">
            bedriftskontakt@online.ntnu.no
          </a>
        </p>
      </div>
    </div>
  )
}

export default CompanyInfoView
