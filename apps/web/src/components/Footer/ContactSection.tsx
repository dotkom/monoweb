import { Text } from "@dotkomonline/ui"
import Link from "next/link"
import type { FC } from "react"

export const ContactSection: FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 md:flex md:flex-row md:gap-24">
    <div className="flex flex-col gap-2">
      <Text element="h3" className="font-medium">
        Hjelp oss bli bedre!
      </Text>

      <div>
        <Text>Oppdaget en feil på nettsiden?</Text>
        <Text>
          Ta kontakt med{" "}
          <a className="underline" href="mailto:dotkom@online.ntnu.no">
            Dotkom
          </a>
        </Text>
      </div>

      <div>
        <Text>Har du lyst til å bidra?</Text>
        <Text>
          Kildekoden finner du på{" "}
          <a className="underline" href="https://www.github.com/dotkom">
            Github
          </a>
        </Text>
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <Text element="h3" className="font-medium">
        Besøksadresse
      </Text>

      <div>
        <Text>A4-137, Realfagbygget</Text>
        <Text>Høgskoleringen 5</Text>
        <Text>NTNU Gløshaugen</Text>
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <Text element="h3" className="font-medium">
        Kontaktinformasjon
      </Text>

      <div>
        <Text>992 548 045 (org. nr.)</Text>
        <Text>
          <Link href="mailto:kontakt@online.ntnu.no" className="hover:underline">
            kontakt@online.ntnu.no
          </Link>
        </Text>
        <Text>
          <Link href="mailto:okonomi@online.ntnu.no" className="hover:underline">
            okonomi@online.ntnu.no
          </Link>
        </Text>
        <Text>+47 986 69 907</Text>
      </div>
    </div>

    <div className="flex flex-col gap-2">
      <Text element="h3" className="font-medium">
        Post og faktura
      </Text>

      <div>
        <Text>Online Linjeforening</Text>
        <Text>Sem Sælands vei 9</Text>
        <Text>7491 Trondheim</Text>
      </div>
    </div>
  </div>
)
