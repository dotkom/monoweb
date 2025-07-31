import { Button, Text, Title } from "@dotkomonline/ui"

export const DebugInfo = () => {
  return (
    <section>
      <div className="relative mt-20 md:mt-60">
        <img
          src="/online-logo-o.svg"
          alt="Online logo"
          className="absolute left-[68%] top-[40%] transform -translate-x-1/2 z-10 w-20 xl:w-60 lg:w-48 md:w-40"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 319"
          role="img"
          aria-labelledby="desc"
          className="relative w-full"
        >
          <desc id="desc">A decorative wave pattern</desc>
          <path
            fill="white"
            fill-opacity="1"
            d="M0,192L48,165.3C96,139,192,85,288,85.3C384,85,480,139,576,
                        138.7C672,139,768,85,864,58.7C960,32,1056,32,1152,69.3C1248,
                        107,1344,181,1392,218.7L1440,256L1440,320L1392,320C1344,320,1248,
                        320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,
                        320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>
      <div className="bg-[#FFFF] py-20 w-full">
        <div className="max-w-screen-xl px-8 md:px-16 mx-auto flex flex-col gap-6">
          <Title element="h1" size="xl">
            Har du opplevd noe ugreit?
          </Title>

          <Text className="mb-4 md:mb-10 text-base md:text-2xl">
            Online har et eget uavhengig organ for varslingssaker som kan hjelpe med alt. Vi ønsker at alle skal ha det
            bra og føle seg trygge. Derfor håper vi at du tar kontakt dersom du har opplevd noe ubehagelig under
            fadderukene. Ser du at noen andre opplever noe ubehagelig er det viktig å huske på at du også har et ansvar
            for å si ifra. Vi tar imot alt, og om du er i tvil er det bare å sende oss en melding. Tar du kontakt med
            oss vil all informasjon behandles strengt konfidensielt. Vi kan bistå med alt fra en uformell prat til å
            hjelpe deg med å oppsøke profesjonell hjelp eller rådgivning.
          </Text>

          <Button
            variant="solid"
            color="brand"
            element="a"
            href="https://docs.google.com/forms/d/e/1FAIpQLScvjEqVsiRIYnVqCNqbH_-nmYk3Ux6la8a7KZzsY3sJDbW-iA/viewform"
            className="w-fit text-2xl px-8 min-h-[5rem] rounded-xl"
          >
            Ta kontakt med Debug
          </Button>
        </div>
      </div>
    </section>
  )
}
