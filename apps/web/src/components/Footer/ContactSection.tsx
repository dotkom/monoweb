"use client"

import { useCopyToClipboard } from "@/utils/use-copy-to-clipboard"
import { Text } from "@dotkomonline/ui"
import { IconCheck, IconClipboard } from "@tabler/icons-react"

export const ContactSection = () => {
  const { icon: copyKontaktEmailIcon, copy: copyKontaktEmail } = useCopyToClipboard()
  const { icon: copyOkonomiEmailIcon, copy: copyOkonomiEmail } = useCopyToClipboard()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:flex md:flex-row md:gap-24">
      <div className="flex flex-col gap-2">
        <Text element="h3" className="font-medium">
          Hjelp oss bli bedre!
        </Text>

        <div>
          <Text>Oppdaget en feil på nettsiden?</Text>
          <Text>
            Ta kontakt med{" "}
            <a className="underline" href="mailto:dotkom@online.ntnu.no" target="_blank" rel="noopener noreferrer">
              Dotkom
            </a>
          </Text>
        </div>

        <div>
          <Text>Har du lyst til å bidra?</Text>
          <Text>
            Kildekoden finner du på{" "}
            <a className="underline" href="https://www.github.com/dotkom" target="_blank" rel="noopener noreferrer">
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

        <div className="flex flex-col w-fit">
          <Text>992 548 045 (org. nr.)</Text>

          <button
            type="button"
            aria-label="Kopier e-postadresse"
            onClick={() => copyKontaktEmail("kontakt@online.ntnu.no")}
            className="group relative flex flex-row items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-stone-800 px-1 -mx-1 py-0.25 -my-0.25 rounded-md hover:-ml-6 hover:pl-6"
          >
            <Text>kontakt@online.ntnu.no</Text>

            <div
              className="pointer-events-none absolute top-1/2 left-1 -translate-y-1/2 invisible group-hover:visible"
              aria-hidden
            >
              {copyKontaktEmailIcon === "check" ? (
                <IconCheck className="shrink-0 size-4 text-green-600 dark:text-green-400" />
              ) : (
                <IconClipboard className="shrink-0 size-4" />
              )}
            </div>
          </button>

          <button
            type="button"
            aria-label="Kopier e-postadresse"
            onClick={() => copyOkonomiEmail("okonomi@online.ntnu.no")}
            className="group relative flex flex-row items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-stone-800 px-1 -mx-1 py-0.25 -my-0.25 rounded-md hover:-ml-6 hover:pl-6"
          >
            <Text>okonomi@online.ntnu.no</Text>

            <div
              className="pointer-events-none absolute top-1/2 left-1 -translate-y-1/2 invisible group-hover:visible"
              aria-hidden
            >
              {copyOkonomiEmailIcon === "check" ? (
                <IconCheck className="shrink-0 size-4 text-green-600 dark:text-green-400" />
              ) : (
                <IconClipboard className="shrink-0 size-4" />
              )}
            </div>
          </button>

          <Text>+47 467 47 280</Text>
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
}
