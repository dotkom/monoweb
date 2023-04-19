import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@dotkomonline/ui"
import { DotFilledIcon} from "@radix-ui/react-icons"
import { trpc } from "@/utils/trpc"
import { format } from "path"
import { useEffect, useRef } from "react"

const dummyMark = {
  id: "",
  title: "Første Mark",
  givenAt: new Date,
  updatedAt: new Date,
  category: "",
  details: "",
  duration: 2000000
}
const dummyMark1 = {
  id: "",
  title: "Andre Mark",
  givenAt: new Date,
  updatedAt: new Date,
  category: "",
  details: "",
  duration: 9000000000009
}
const dummyMark2 = {
  id: "",
  title: "Tredje Mark",
  givenAt: new Date,
  updatedAt: new Date,
  category: "Sosialt",
  details: "",
  duration: 100000
}

const listdum = [dummyMark,dummyMark1,dummyMark2,];


const PenaltiesPage: NextPageWithLayout = () => {
  return (
    <div className="flex flex-col space-y-12 ml-3">
          <p className="text-2xl">Prikker</p>
          <div className="flex flex-col">
            <p className="text-xl">Aktive Prikker</p>
            {activePenalties}
          </div>
          <div>
            <p className="text-xl">Gamle Prikker</p>
            {oldPenalties}
          </div>
          <div className="flex flex-col space-y-2">
            <p className="text-xl">Suspensjoner</p>
            {suspensions}
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
  title: String;
  category: String;
  givenAt: Date;
  duration: number;
}


const PenaltyAccordion = (props : AccordionSetup) => {
  return (
    <Accordion type="single" collapsible>
    <AccordionItem value="item-1">
      <AccordionTrigger className="text-lg ml-1"><span className="flex"><DotFilledIcon className="mt-1"/>{props.title}</span></AccordionTrigger>
      <AccordionContent className="ml-4">
        <div className="flex flex-col space-y-4">
        <p> Du har fått en prikk på grunn av {props.title}</p>
        <p className="text-lg"><span className="font-bold">Katergori: </span>{props.category}</p>
        <p className="text-lg"><span className="font-bold">Utløpsdato: </span>
          {new Date(props.givenAt.getTime() + props.duration).toLocaleString()}    
          </p>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
)}

const activePenalties = listdum.map(mark => <PenaltyAccordion title={mark.title} category={mark.category} givenAt={mark.givenAt} duration={mark.duration}/>);
const oldPenalties = listdum.map(mark => <PenaltyAccordion title={mark.title} category={mark.category} givenAt={mark.givenAt} duration={mark.duration}/>);
const suspensions = listdum.map(mark => <PenaltyAccordion title={mark.title} category={mark.category} givenAt={mark.givenAt} duration={mark.duration}/>);


export default PenaltiesPage
