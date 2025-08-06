import { Button, Text, Title } from "@dotkomonline/ui"

export const LinjeforeningInfo = () => {
  return (
    <section className="relative text-white bg-brand">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 32" role="img" aria-labelledby="desc">
        <desc id="desc">A decorative slant</desc>
        <path fill="white" fill-opacity="1" d="M0,32L1440,0L1440,0L0,0Z" />
      </svg>
      <div className="max-w-screen-xl px-8 md:px-16 mx-auto flex flex-col gap-10 py-48 max-sm:py-20 max-sm:items-center ">
        <Title element="h1" size="xl">
          Bli aktiv i linjeforeningen!
        </Title>

        <Text className="text-base md:text-2xl">
          Online er linjeforeningen for alle som studerer informatikk. Gå videre til{" "}
          <a href="https://online.ntnu.no/" className="underline text-accent-800">
            hovednettsiden
          </a>{" "}
          for å lage brukerkonto og bli medlem.
        </Text>

        <Text className="text-base md:text-2xl">
          Er det noe du lurer på om linjeforeningen Online? En kjapp innføring i dette kan du finne på{" "}
          <a
            href="https://wiki.online.ntnu.no/info/sosialt-og-okonomisk/ditt-liv-som-onliner/"
            className="underline text-accent-800"
          >
            wikien
          </a>
          .
        </Text>

        <Text className="text-base md:text-2xl">
          Har du lyst til å gjøre studietiden enda bedre? Som komitemedlem i Online blir du del av en familie du aldri
          vil glemme. Vi tilbyr utfordrende og spennende verv i et meget sosialt miljø med stor takhøyde.
          <br />
          Les mer om de ulike komiteene og send inn din søknad på opptakssiden vår i lenken under.
        </Text>

        <Button
          variant="solid"
          color="light"
          element="a"
          href="https://opptak.online.ntnu.no/"
          className="w-fit text-2xl px-8 min-h-[5rem] rounded-xl"
        >
          Gå til opptakssiden
        </Button>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 32" role="img" aria-labelledby="desc" className="block">
        <desc id="desc">A decorative slant</desc>
        {/* #ffedd4 is Tailwind's orange-100 */}
        <path fill="#ffedd4" d="M1440,0.5L0,32L0,32L1440,32Z" />
      </svg>
    </section>
  )
}
