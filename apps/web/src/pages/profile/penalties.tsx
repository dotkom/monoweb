import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@dotkomonline/ui"
import { DotFilledIcon} from "@radix-ui/react-icons"
import { useEffect } from "react"
import PenaltyRules from "./penaltyRules"

const dummyMark = {
  id: "",
  title: "Første Mark",
  givenAt: new Date,
  updatedAt: new Date,
  category: "",
  details: "manglende møte på Dåp",
  duration: 2000000
}
const dummyMark1 = {
  id: "",
  title: "Andre Mark",
  givenAt: new Date,
  updatedAt: new Date,
  category: "",
  details: "flexing av hook med 05",
  duration: 9000000000009
}
const dummyMark2 = {
  id: "",
  title: "Tredje Mark",
  givenAt: new Date,
  updatedAt: new Date,
  category: "Sosialt",
  details: "manglende prikker",
  duration: 100000
}

const listOfDummyMarks = [dummyMark,dummyMark1,dummyMark2,];


const PenaltiesPage: NextPageWithLayout = () => {
  useEffect(() => {
    const AccordionList = Array.from(document.getElementsByClassName("taper"))
    const closeAllAccordions = (event: MouseEvent) => {
        console.log("hei")
    }
  
    document.addEventListener("click", closeAllAccordions)
  })
  return (
    <div className="flex flex-col space-y-12 ml-3">
          <p className="text-[28px] font-medium">Prikker</p>
          <div className="flex flex-col">
            <p className="text-[24px] font-medium">Aktive Prikker</p>
            {activePenalties}
          </div>
          <div>
            <p className="text-[24px] font-medium">Gamle Prikker</p>
            {oldPenalties}
          </div>
          <div className="flex flex-col space-y-2">
            <p className="text-[24px] font-medium">Suspensjoner</p>
            {suspensions}
          </div>
          <div>
            <p className="text-[24px] font-medium">PrikkeRegler</p>
            <Accordion className="max-w-[590px]" type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg ml-1">Prikkeregler</AccordionTrigger>
                <AccordionContent className="ml-4"> <PenaltyRules/> </AccordionContent>
              </AccordionItem>
            </Accordion>
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
  details: String;
}

// TODO: Set up router for Users personal marks

const PenaltyAccordion = (props : AccordionSetup) => {
  const expirationDate = new Date(props.givenAt.getTime() + props.duration).toLocaleString()
  return (
    <Accordion type="single" collapsible>
    <AccordionItem value="item-1">
      <AccordionTrigger className="text-lg ml-1"><span className="flex"><DotFilledIcon className="mt-1"/>{props.title}</span></AccordionTrigger>
      <AccordionContent className="ml-4">
        <div className="flex flex-col space-y-4">
          <p> Du har fått en prikk på grunn av {props.details} den {props.givenAt.toLocaleString()}</p>
          <p className="text-lg"><span className="font-bold">Katergori: </span>{props.category}</p>
          <p className="text-lg"><span className="font-bold">Utløpsdato: </span>{expirationDate}</p>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
)}

const activePenalties = listOfDummyMarks.map(mark => <PenaltyAccordion title={mark.title} category={mark.category} givenAt={mark.givenAt} duration={mark.duration} details={mark.details}/>);
const oldPenalties = listOfDummyMarks.map(mark => <PenaltyAccordion title={mark.title} category={mark.category} givenAt={mark.givenAt} duration={mark.duration} details={mark.details}/>);
const suspensions = listOfDummyMarks.map(mark => <PenaltyAccordion title={mark.title} category={mark.category} givenAt={mark.givenAt} duration={mark.duration} details={mark.details}/>);


export default PenaltiesPage
