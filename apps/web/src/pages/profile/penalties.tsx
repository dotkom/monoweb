import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@dotkomonline/ui"

const PenaltiesPage: NextPageWithLayout = () => {
  return (
        <div className="flex flex-col space-y-5 ml-3">
          <p className="text-3xl">Prikker</p>
          <div>
            <p className="text-2xl">Aktive Prikker</p>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <div>
            <p className="text-2xl">Gamle Prikker</p>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <div>
            <p className="text-2xl">PrikkeRegler</p>
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

export default PenaltiesPage
