import { Button, Icon } from "@dotkomonline/ui"
import Image from "next/image"
import { type FC } from "react"
import Link from "next/link"
import { type JobListing } from "@dotkomonline/types"
import { format } from "date-fns"
import PortableText from "@/components/molecules/PortableText"
import { type CareerAd } from "@/api/get-career-ads"

interface JobListingAdViewProps {
  career: JobListing
}

export const JobListingAdView: FC<JobListingAdViewProps> = ({ career }) => {
  const {
    company: { name: company_name, image }, 
    title,
    ingress,
    deadline,
    locations,
    employment,
    applicationLink,
  } = career

  const deadline2 = deadline ? format(deadline, "dd.MM.yyyy") : "Ingen frist"
  return (
    <div className="mx-auto mt-10 flex w-10/12 justify-between">
      <div className="w-1/3">
        <div className="relative pb-10">
          <Image src={image || ""} width={4000} height={250} alt="company_image" />
        </div>

        {/* <p>{company_info}</p> */}
        <p>TODO</p>

        <div className="bg-slate-12 mx-auto mb-14 mt-10 h-[0.5px] w-full" />
        <Link href="/career">
          <div className="flex items-center">
            <Icon icon="mdi:arrow-left" className="text-blue-9" width={20} height={20} />
            <h2 className="m-0 border-0 pl-2 text-base text-blue-500"> ANDRE MULIGHETER</h2>
          </div>
        </Link>
        <div className="bg-slate-9 mb-7 mt-3 h-[0.5px] w-full" />
        <div className="my-3 flex items-center">
          <Icon icon="mdi:globe" className="text-blue-9" width={20} height={20} />
          <p className="m-0 pl-2">{locations.join(" ")}</p>
        </div>
        <div className="bg-slate-9 my-7 h-[0.5px] w-full" />
        <div className="my-3 flex items-center">
          <div className="text-blue-9 mb-[-3px] inline">
            <Icon icon="mdi:clock-outline" className="text-blue-9" width={20} height={20} />
          </div>
          <p className="m-0 pl-2">{deadline2}</p>
        </div>
        <div className="bg-slate-9 my-7 h-[0.5px] w-full" />
        <div className="my-3 flex items-center">
          <div className="text-blue-9 mb-[-3px] inline">
            <Icon icon="mdi:briefcase-outline" className="text-blue-9" width={20} height={20} />
          </div>
          {/* <p className="m-0 pl-2">{career_role}</p> */}
          <p className="m-0 pl-2">TODO</p>
        </div>
        <div className="bg-slate-9 my-7 h-[0.5px] w-full" />
        <div className="my-3 flex items-center">
          <div className="text-blue-9 mb-[-3px] inline">
            <Icon icon="mdi:content-copy" className="text-blue-9" width={20} height={20} />
          </div>
          {/* <p className="m-0 pl-2">{career_role}</p> */}
          <p className="m-0 pl-2">TODO</p>
        </div>
        <div className="bg-slate-9 mb-3 mt-7 h-[0.5px] w-full" />
        <div className="text-blue-9">
          {/* {linkdin && (
            <Link href={linkdin}>
              <Icon width={40} height={40} icon="devicon:linkedin" className="m-1 inline-block" />
            </Link>
          )}
          {twitter && (
            <Link href={twitter}>
              <Icon width={40} height={40} icon="devicon:twitter" className="m-1 inline-block" />
            </Link>
          )}
          {facebook && (
            <Link href={facebook}>
              <Icon width={40} height={40} icon="devicon:facebook" className="m-1 inline-block" />
            </Link>
          )} */}
        </div>
        <Link href={applicationLink || ""}>
          <Button className="bg-blue-8 mt-3 w-20">Søk</Button>
        </Link>
      </div>
      <div className="w-2/3">
        <div className="border-amber-9 ml-8 mt-2 border-l-[1px] pl-4">
          <p className="m-0 text-4xl font-bold">{company_name}</p>
          <p className="m-0 text-3xl">{title}</p>
        </div>
        <div className="[&>*]:border-amber-9 mb-12 ml-8 flex flex-col gap-6 [&>*]:border-l-[1px] [&>*]:pl-4 [&>h2]:m-0 [&>h2]:border-b-0">
          {/* <PortableText blocks={content} /> */}
        </div>
      </div>
    </div>
  )
}
