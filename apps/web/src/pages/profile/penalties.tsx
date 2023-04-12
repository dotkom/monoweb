import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@dotkomonline/ui"
import { trpc } from "@/utils/trpc"

const PenaltiesPage: NextPageWithLayout = () => {
  return (
        <div className="flex flex-col space-y-5 ml-3">
          <p className="text-3xl">Prikker</p>
          <div className="flex flex-col">
            <p className="text-2xl bg-blue-6">Aktive Prikker</p>
            <Accordion className="pt-0" type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg">Is it accessible?</AccordionTrigger>
                <AccordionContent>It is here</AccordionContent>
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
