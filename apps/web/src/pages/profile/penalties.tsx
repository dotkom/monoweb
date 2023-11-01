import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@dotkomonline/ui"
import { DotFilledIcon } from "@radix-ui/react-icons"
import { type FC } from "react"
import { addMinutes, format } from "date-fns"
import ProfileLayout from "@/components/layout/ProfileLayout"
import MainLayout from "@/components/layout/MainLayout"
import PenaltyRules from "@/utils/penalty-rules"
import { type NextPageWithLayout } from "../_app"

/* TODO - Set up connection to Users marks router */

interface PenaltyAccordionProps {
  title: string
  category: string
  givenAt: Date
  duration: number
  details: string
}

const PenaltyAccordion: FC<PenaltyAccordionProps> = (props) => (
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
          <p>
            Du har fått en prikk på grunn av {props.details} den {format(props.givenAt, "dd/MM/yyyy")}
          </p>
          <p className="text-lg">
            <span className="font-bold">Katergori: </span>
            {props.category}
          </p>
          <p className="text-lg">
            <span className="font-bold">Utløpsdato: </span>
            {format(addMinutes(props.givenAt, props.duration), "dd/MM/yyyy")}
          </p>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
)

const PenaltiesPage: NextPageWithLayout = () => (
  <div className="ml-3 flex flex-col space-y-12">
    <p className="text-slate-10">Oversikt over dine prikker</p>
    <div className="flex flex-col">
      <p className="text-2xl font-medium">Aktive Prikker</p>
      {/* TODO - Get active marks */}
      <PenaltyAccordion title="TestPrikk" category="Sosial" givenAt={new Date()} duration={2000} details="Testing" />
      <p>Ingen aktive prikker</p>
    </div>
    <div>
      <p className="text-2xl font-medium">Gamle Prikker</p>
      {/* TODO - Get old marks */}
      <p>Ingen gamle prikker</p>
    </div>
    <div className="flex flex-col space-y-2">
      <p className="text-2xl font-medium">Suspensjoner</p>
      {/* TODO - Get suspensions */}
      <p>Ingen suspensjoner</p>
    </div>
    <div>
      <p className="text-2xl font-medium">PrikkeRegler</p>
      <PenaltyRules />
    </div>
  </div>
)

PenaltiesPage.getLayout = (page) => (
  <MainLayout>
    <ProfileLayout>{page}</ProfileLayout>
  </MainLayout>
)

export default PenaltiesPage
