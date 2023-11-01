import React, { useEffect, useState } from "react"
import { Button, Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@dotkomonline/ui"

const ProfileMembership = () => {
  const [active, setActive] = useState(false)
  const [denied, setDenied] = useState(false)
  const [approved, setApproved] = useState(true)

  
  useEffect(() => {
    setActive(false)
    setDenied(false)
    setApproved(true)
  }, []);

  return (
    <div className="my-10">
      <h2>Medlemsskap</h2>
      <p className="mt-5">
        Her kan du administrere dine søknader for medlemskap i Online, Linjeforeningen for Informatikk.
      </p>
      <p>Du trenger medlemsskap for å melde deg på linje-spesifikke arrangementer.</p>
      <br />

      <Button color="blue" variant="solid" className="mb-5">
        Søk medlemsskap automatisk gjennom Dataporten
      </Button>
      <br />
      <Button color="blue" variant="solid" className="mb-5">
        Søk medlemsskap med manuell godkjenning
      </Button>

      <p>NB! Godkjente og avslåtte søknader havner nederst på siden, sjekk der før du sender inn nye søknader!</p>

      <Accordion type="single" collapsible className="mb-10">
        <AccordionItem value="item-1">
          <AccordionTrigger>Aktive søknader</AccordionTrigger>
          <AccordionContent>
            {active && <h3>Medlemskap- og studieretningssøknad for Ola Nordmann</h3>}
            Du har ingen aktive søknader.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Avslåtte søknader</AccordionTrigger>
          <AccordionContent>
            {denied && <h3>Medlemskap- og studieretningssøknad for Ola Nordmann</h3>}
            Du har ingen aktive søknader.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Godkjente søknader</AccordionTrigger>
          <AccordionContent>
            {approved && <h3>Medlemskap- og studieretningssøknad for Ola Nordmann</h3>}
            <table>
              <tr>
                <td className="min-w-56 w-2/5 font-semibold">Opprettet dato:</td>
                <td>16. august 2022 14:12</td>
              </tr>
              <tr>
                <td className="min-w-56 w-2/5 font-semibold">Startet på studiet:</td>
                <td>1. juli 2021</td>
              </tr>
              <tr>
                <td className="min-w-56 w-2/5 font-semibold">Studieretning:</td>
                <td>Bachelor i Informatikk</td>
              </tr>
              <tr>
                <td className="min-w-56 w-2/5 font-semibold">Utløpsdato for medlemskap:</td>
                <td>15. september 2024</td>
              </tr>
              <tr>
                <td className="min-w-56 w-2/5 font-semibold">Melding fra godkjenner:</td>
                <td>Automatisk godkjent gjennom integrasjon mot Dataporten.</td>
              </tr>
            </table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
export default ProfileMembership
