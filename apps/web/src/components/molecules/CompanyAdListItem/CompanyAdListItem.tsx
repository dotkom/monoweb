import type { CareerAd } from "@/api/get-career-ads"
import { Badge } from "@dotkomonline/ui"
import { format } from "date-fns"
import Image from "next/image"
import type { FC } from "react"

interface CompanyAdListItemProps {
  career: CareerAd
}

const CompanyAdListItem: FC<CompanyAdListItemProps> = (props: CompanyAdListItemProps) => {
  const { company_name, image, career_type, location, deadline, slug } = props.career

  const color = career_type === "Sommerjobb" ? "amber" : career_type === "Fulltid" ? "red" : "blue"

  return (
    <div className="border-slate-11 flex h-16 items-center justify-between border-b">
      <div className="flex h-10 w-1/4 items-center gap-2 overflow-hidden">
        <Image src={image.asset.url} width={70} height={40} alt={`${company_name}'s job posting`} />
        <p>{company_name}</p>
      </div>

      <div className="w-1/4">
        <Badge color={color} variant="light">
          {career_type}
        </Badge>
      </div>
      <span className="w-[17.5%]">{location.concat("")}</span>
      <span className="w-[17.5%]">{format(new Date(deadline), "dd.MM.yyyy")}</span>
      <a className="w-[15%]" href={`/career/${slug.current}`}>
        Les mer
      </a>
    </div>
  )
}

export default CompanyAdListItem
