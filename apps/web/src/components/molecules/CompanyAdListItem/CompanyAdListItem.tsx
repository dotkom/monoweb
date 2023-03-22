import { CareerAd } from "@/api/get-career-ads"
import { Badge } from "@dotkomonline/ui"
import { format } from "date-fns"
import Image from "next/image"
import { FC } from "react"

interface CompanyAdListItemProps {
  career: CareerAd
}

const CompanyAdListItem: FC<CompanyAdListItemProps> = (props: CompanyAdListItemProps) => {
  const { company_name, image, career_type, location, deadline, slug, link } = props.career

  return (
    <div className="grid grid-cols-5 mt-5">
      <div className="flex">
        <Image src={image.asset.url} width={70} height={40} alt={`${company_name}'s job posting`} />
        <p>{company_name}</p>
      </div>

      <div>
        <Badge color="red" variant="light">
          {career_type}
        </Badge>
      </div>
      <span>{location.concat("")}</span>
      <span>{format(new Date(deadline), "dd.MM.yyyy")}</span>
      <a href={`/career/${slug.current}`}>Les mer</a>
    </div>
  )
}

export default CompanyAdListItem
