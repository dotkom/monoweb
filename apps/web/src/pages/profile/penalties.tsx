import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@dotkomonline/ui"
import { DotFilledIcon} from "@radix-ui/react-icons"
import { trpc } from "@/utils/trpc"

const PenaltiesPage: NextPageWithLayout = () => {
  return (
        <div className="flex flex-col space-y-7 ml-3">
          <p className="text-2xl">Prikker</p>
          <div className="flex flex-col">
            <p className="text-xl bg-blue-6">Aktive Prikker</p>
            <PenaltyAccordion header={"Hallo"} content={"ashsh"} />
          </div>
          <div>
            <p className="text-xl">Gamle Prikker</p>
            <PenaltyAccordion header={"Flexet hook med 05"} content={"Utløpt"} />
            <PenaltyAccordion header={"Ble ikke med på shots i Åre"} content={"Utløpt"} />
          </div>
          <div>
            <p className="text-xl">Suspensjoner</p>
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
    header : String;
    content: String;
}

const PenaltyAccordion = (props : AccordionSetup) => {
  return (
  <Accordion type="single" collapsible>
    <AccordionItem value="item-1">
      <AccordionTrigger className="text-lg ml-1"><span className="flex"><DotFilledIcon className="mt-1"/>{props.header}</span></AccordionTrigger>
      <AccordionContent className="ml-4">{props.content}</AccordionContent>
    </AccordionItem>
  </Accordion>
)}

export default PenaltiesPage
