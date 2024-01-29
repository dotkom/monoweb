import { type JobListing } from "@dotkomonline/types"
import { Badge } from "@dotkomonline/ui"
import { format } from "date-fns"
import Image from "next/image"
import { type FC } from "react"
interface CompanyAdListItemProps {
  career: JobListing
}
const CompanyAdListItem: FC<CompanyAdListItemProps> = ({ career }: CompanyAdListItemProps) => {
  const color =
    career.employment === "Sommerjobb/internship" ? "amber" : career.employment === "Fulltid" ? "red" : "blue"
  const deadline = career.deadline ? format(career.deadline, "dd.MM.yyyy") : "Ingen frist"
  return (
    <div className="border-slate-11 flex h-16 items-center justify-between border-b">
      <div className="flex h-10 w-1/4 items-center gap-2 overflow-hidden">
        <Image src={career.company.image || ""} width={70} height={40} alt={`${career.company.name}’s job posting`} />
        <p>{career.company.name}</p>
      </div>
      <div className="w-1/4">
        <Badge color={color} variant="light">
          {career.employment}
        </Badge>
      </div>
      <span className="w-[17.5%]">{career.locations.concat("")}</span>
      <span className="w-[17.5%]">{deadline}</span>
      <a className="w-[15%]" href={`/career/${career.id}`}>
        Les mer
      </a>
    </div>
  )
}
export default CompanyAdListItem