import { FooterWave } from "@/components/icons/FooterWave.js"
import { Sponsors } from "@/data/sponsors"
import { Text, Title } from "@dotkomonline/ui"
import { SoMeLinks } from "./someLinks"

export const Footer = () => {
  return (
    <footer className="text-white bg-orange-100 pt-20">
      <div className="overflow-hidden">
        <FooterWave color="#C1842E" className="size-[135%]" />
      </div>
      <div className="bg-[#C1842E] flex flex-col items-center py-20">
        <Title element="h3" className="text-4xl m-3 mt-0">
          Har du noen spørsmål?
        </Title>
        <Text className="text-xl text-center mx-4">
          Dersom du lurer på noe, ikke nøl med å ta kontakt! Du kan nå oss på{" "}
          <a href="mailto:kontakt@online.ntnu.no" className="underline">
            kontakt@online.ntnu.no
          </a>
        </Text>
        <SoMeLinks />
      </div>

      {Sponsors && (
        <div className="overflow-hidden">
          <div className="bg-[#C1842E] ">
            <FooterWave color="#F9B759" className="h-[100%] w-[135%] relative left-[-30%]" />
          </div>
          <div className="bg-[#F9B759] flex flex-col items-center py-20">
            <Title element="h3" className="text-4xl m-3 mt-0">
              Våre sponsorer
            </Title>
            <section className="flex flex-wrap justify-center gap-10 mt-4">
              {Sponsors.map((sponsor) => (
                <a
                  key={sponsor.name}
                  href={sponsor.link}
                  target="_blank"
                  className="flex flex-col items-center"
                  rel="noreferrer"
                >
                  <img src={sponsor.logo} alt={`${sponsor.name} logo`} className="h-16 max-sm:h-12 w-auto mb-2" />
                </a>
              ))}
            </section>
          </div>
        </div>
      )}
    </footer>
  )
}
