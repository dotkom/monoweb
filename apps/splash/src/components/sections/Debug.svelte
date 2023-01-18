<script>
  import Link from "../common/Link.svelte"
  import Section from "../common/Section.svelte"
  const phoneNumber = "+47 952 03 046"
</script>

<Section title="Har du opplevd noe ugreit?">
  <div>
    Online har et eget uavhengig organ for varslingssaker som kan hjelpe med alt. Vi ønsker at alle skal ha det bra og
    føle seg trygge. Derfor håper vi at du tar kontakt dersom du har opplevd noe ubehagelig under fadderukene. Ser du at
    noen andre opplever noe ubehagelig er det viktig å huske på at du også har et ansvar for å si ifra. Vi tar imot alt,
    og om du er i tvil er det bare å sende oss en melding. Tar du kontakt med oss vil all informasjon behandles strengt
    konfidensielt. Vi kan bistå med alt fra en uformell prat til å hjelpe deg med å oppsøke profesjonell hjelp eller
    rådgivning.
  </div>

  <div>
    Om situasjonen tilsier at du trenger å snakke med noen umiddelbart kan du alltid ringe oss på <Link
      href={`tel:${phoneNumber}`}>{phoneNumber}</Link
    >.
  </div>

  <Link
    href="https://docs.google.com/forms/d/e/1FAIpQLScvjEqVsiRIYnVqCNqbH_-nmYk3Ux6la8a7KZzsY3sJDbW-iA/viewform?pli=1"
    external>Ta kontakt med oss.</Link
  >
</Section>
