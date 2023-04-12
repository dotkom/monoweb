import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import { Icon } from "@dotkomonline/ui"
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
      <ProfileLayout>
        <PenaltyHeader />
        {page}
      </ProfileLayout>
    </MainLayout>
  )
}

interface AccordionSetup {
  title: string
  category: string
  givenAt: Date
  duration: number
  details: string
}

const PenaltyAccordion = (props: AccordionSetup) => {
  const givenAtDate =
    props.givenAt.getDate().toString() +
    "." +
    props.givenAt.getMonth().toString() +
    "." +
    props.givenAt.getFullYear().toString()
  const expirationDate = new Date(props.givenAt.getTime() + props.duration)
  const expirationDateFormat =
    expirationDate.getDate().toString() +
    "." +
    expirationDate.getMonth().toString() +
    "." +
    expirationDate.getFullYear().toString()
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
            <p>

              Du har fått en prikk på grunn av {props.details} den {givenAtDate}
            </p>
            <p className="text-lg">
              <span className="font-bold">Katergori: </span>
              {props.category}
            </p>
            <p className="text-lg">
              <span className="font-bold">Utløpsdato: </span>
              {expirationDateFormat}
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

const activePenalties = listOfDummyMarks.length
  ? listOfDummyMarks.map((mark) => (
      <PenaltyAccordion
        key={"active"}
        title={mark.title}
        category={mark.category}
        givenAt={mark.givenAt}
        duration={mark.duration}
        details={mark.details}
      />
    ))
  : "Du har ingen aktive prikker"
const oldPenalties = listOfDummyMarks.length
  ? listOfDummyMarks.map((mark) => (
      <PenaltyAccordion
        key={"old"}
        title={mark.title}
        category={mark.category}
        givenAt={mark.givenAt}
        duration={mark.duration}
        details={mark.details}
      />
    ))
  : "Du har ingen gamle prikker"
const suspensions = emptylist.length
  ? listOfDummyMarks.map((mark) => (
      <PenaltyAccordion
        key={"suspensions"}
        title={mark.title}
        category={mark.category}
        givenAt={mark.givenAt}
        duration={mark.duration}
        details={mark.details}
      />
    ))
  : "Du har ingen suspensjoner"

export default PenaltiesPage
