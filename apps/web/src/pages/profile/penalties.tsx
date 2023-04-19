import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@dotkomonline/ui"
import { DotFilledIcon} from "@radix-ui/react-icons"
import { trpc } from "@/utils/trpc"

const PenaltiesPage: NextPageWithLayout = () => {
  return (
        <div className="flex flex-col space-y-12 ml-3">
          <p className="text-2xl">Prikker</p>
          <div className="flex flex-col">
            <p className="text-xl">Aktive Prikker</p>
            <PenaltyAccordion reason={"Møtte ikke opp på sin egen Dåp"} category={"Sosialt"} expirationDate={"29.01.2023"} />
          </div>
          <div>
            <p className="text-xl">Gamle Prikker</p>
            <PenaltyAccordion reason={"Flexet hook med 05"} category={"Sosialt"} expirationDate={"29.01.2023"} />
            <PenaltyAccordion reason={"Ble ikke med på shots i Åre"} category={"Sosialt"} expirationDate={"29.01.2023"} />
          </div>
          <div className="flex flex-col space-y-2">
            <p className="text-xl">Suspensjoner</p>
            <p>Du har ingen suspensjoner</p>
          </div>
          <div>
            <p className="text-xl">PrikkeRegler</p>
          </div>
        </div>
)}

PenaltiesPage.getLayout = (page) => {
  return (
    <MainLayout>
      <ProfileLayout>{page}</ProfileLayout>
    </MainLayout>
  )
}


interface AccordionSetup {
    reason?: String;
    category: String;
    expirationDate: String
}

const PenaltyAccordion = (props : AccordionSetup) => {
  return (
  <Accordion type="single" collapsible>
    <AccordionItem value="item-1">
      <AccordionTrigger className="text-lg ml-1"><span className="flex"><DotFilledIcon className="mt-1"/>{props.reason}</span></AccordionTrigger>
      <AccordionContent className="ml-4">
        <div className="flex flex-col space-y-4">
        <p> Du har fått en prikk på grunn av {props.reason}</p>
        <p><span className="font-bold text-lg">Katergori:</span> {props.category}</p>
        <p><span className="font-bold text-lg">Utløpsdato:</span> {props.expirationDate}</p>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
)}

export default PenaltiesPage
