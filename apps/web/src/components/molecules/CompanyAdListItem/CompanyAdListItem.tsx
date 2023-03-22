import { Badge } from "@dotkomonline/ui"
import { format } from "date-fns"
import Image from "next/image"
import { FC } from "react"

interface CompanyAdListItemProps {
  /*
  name: string
  logo: string
  position: string
  location: string[]
  deadline: Date
  showApplyLink?: boolean
  applyLink?: string*/
  career: CareerAd
}

const CompanyAdListItem: FC<CompanyAdListItemProps> = (props) => {
  //const { name, logo, position, location, deadline, applyLink, showApplyLink = false } = props
  const { company_name, image, career_type, location, deadline, slug } = props.career

  return (
    <div className="grid grid-cols-5">
      <div>
        <Image src={logo} width={70} height={40} alt={`${name}'s job posting`} />
      </div>
      <p>{name}</p>
      <div>
        <Badge color="red" variant="light">
          {position}
        </Badge>
      </div>
      <span>{location.concat("")}</span>
      <span>{format(deadline, "DDD")}</span>
      {showApplyLink && <p>{applyLink}</p>}
    </div>
  )
}

export default CompanyAdListItem
