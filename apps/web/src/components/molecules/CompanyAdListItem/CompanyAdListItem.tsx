import { type JobListing } from "@dotkomonline/types"
import { Badge, Icon } from "@dotkomonline/ui"
import { format } from "date-fns"
import Image from "next/image"
import { type FC } from "react"
interface CompanyAdListItemProps {
  career: JobListing
}
function opprettelseTidspunkt(date: Date){  
  if (Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60)) < 1) {
    return <div>nylig lagt til</div> 
  }
  else if (Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60)) < 24) {
    const timer = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    return <div>{timer} timer gammel</div>  
  }
  else if (Date.now() - date.getTime()/ (24 * 60 * 60 * 1000) < 7) {
    const dager = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    return <div>{dager} dager gammel</div>
  }
  else if (Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 7)) < 52) {
    const uker = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 7));
    return <div>{uker} uker gammel</div>
  }
}
function showLocations(locations: string[]) {
  if (locations.length === 0) {
    return <p>Ikke definert</p>
  }
  return (
    <div className="flex flex-row gap-1">
      {locations.map((location) => (
        <p key={location}>{location}</p>
      ))}
    </div>
  )

}
const CompanyAdListItem: FC<CompanyAdListItemProps> = ({ career }: CompanyAdListItemProps) => {
  const color =
    career.employment === "Sommerjobb/internship" ? "amber" : career.employment === "Fulltid" ? "red" : "blue"
  const deadline = career.deadline ? format(career.deadline, "dd.MM.yyyy") : "Ingen frist"
  return (
    <a href={`/career/${career.id}`} className="border-slate-8 px-6 h-[130px] py-2 flex items-center justify-between border rounded-lg">
      <div className="items-center flex gap-8 flex-row">
        <Image src={career.company.image || ""} width={140} height={80} alt={`${career.company.name}’s job posting`} />
        <div>
      <h3 className="mt-2">{career.company.name}</h3>
      <p className="text-slate-8">{career.employment}</p>
      <div className="flex flex-row gap-4">
      <div className="flex flex-row gap-1">
        <Icon width={16} icon={"tabler:map-pin"} />
        {showLocations(career.locations)}
      </div>
      <div className="flex flex-row gap-1"><Icon width={16} icon={"tabler:clock-hour-3"}/>{opprettelseTidspunkt(career.start)}</div>
      </div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className=" text-right">
      <Badge color={color} variant="light">
          {career.employment}
        </Badge>
        </div>
        <div className="text-right flex flex-row gap-1">
        <Icon width={16} icon={"tabler:calendar-down"} /> 
        <p>
        <b>Frist: </b>
        {career.deadline == null ? "Ingen Frist" : career.deadline.toLocaleString('no-NO',{day: '2-digit', month: 'short', year: 'numeric'})}
        </p>
        </div>
      </div>
        
    </a>
  )
}
export default CompanyAdListItem