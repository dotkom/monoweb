import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@dotkomonline/ui"
import { DotFilledIcon } from "@radix-ui/react-icons"
import PenaltyRules from "./penaltyRules"
import { Mark, User } from "@dotkomonline/types"
import { FC } from "react"
import { format } from "date-fns"

/* TODO - Set up connection to Users marks router */
const PenaltiesPage: NextPageWithLayout = () => {
  return (
    <div className="ml-3 flex flex-col space-y-12">
      <p className="text-slate-10">Oversikt over dine prikker</p>
      <div className="flex flex-col">
        <p className="text-2xl font-medium">Aktive Prikker</p>
        <p>Ingen aktive prikker</p>
      </div>
      <div>
        <p className="text-2xl font-medium">Gamle Prikker</p>
        <p>Ingen gamle prikker</p>
      </div>
      <div className="flex flex-col space-y-2">
        <p className="text-2xl font-medium">Suspensjoner</p>
        <p>Ingen suspensjoner</p>
      </div>
      <div>
        <p className="text-2xl font-medium">PrikkeRegler</p>
        <PenaltyRules />
      </div>
    </div>
  )
}

PenaltiesPage.getLayout = (page) => {
  return (
    <MainLayout>
      <ProfileLayout>{page}</ProfileLayout>
    </MainLayout>
  )
}

interface PenaltyAccordionProps {
  title: string
  category: string
  givenAt: dateFns
  duration: number
  details: string
}

const PenaltyAccordion: FC<PenaltyAccordionProps> = (props) => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger className="accordions ml-1 text-lg">
          <span className="flex">
            <DotFilledIcon className="mt-1" />
            {props.title}
          </span>
        </AccordionTrigger>
        <AccordionContent className="ml-4">
          <div className="flex flex-col space-y-4">
            <p>Du har fått en prikk på grunn av {props.details} den</p>
            <p className="text-lg">
              <span className="font-bold">Katergori: </span>
              {props.category}
            </p>
            <p className="text-lg">
              <span className="font-bold">Utløpsdato: </span>
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default PenaltiesPage
