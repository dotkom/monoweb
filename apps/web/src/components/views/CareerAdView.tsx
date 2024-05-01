import type { JobListing } from "@dotkomonline/types"
import { Button, Icon } from "@dotkomonline/ui"
import { format } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import type { FC } from "react"

interface CareerAdViewProps {
  career: JobListing
}

export const CareerAdView: FC<CareerAdViewProps> = (props: CareerAdViewProps) => {
  const {
    title,
    applicationEmail,
    applicationLink,
    company,
    createdAt,
    deadlineAsap,
    description,
    employment,
    end,
    featured,
    id,
    ingress,
    locations,
    start,
    deadline,
  } = props.career

  return (
    <div className="mx-auto mt-10 flex w-10/12 justify-between">
      <div className="w-1/3">
        <div className="relative pb-10">
          {company.image && <Image src={company.image} width={4000} height={250} alt="company_image" />}
        </div>

        <p>{ingress}</p>

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
          <p className="m-0 pl-2">{locations}</p>
        </div>
        <div className="bg-slate-9 my-7 h-[0.5px] w-full" />
        <div className="my-3 flex items-center">
          <div className="text-blue-9 mb-[-3px] inline">
            <Icon icon="mdi:clock-outline" className="text-blue-9" width={20} height={20} />
          </div>
          {deadline ? (
            <p className="m-0 pl-2">{format(deadline, "dd.mm.yyyy")}</p>
          ) : (
            <p className="m-0 pl-2">Ingen frist</p>
          )}
        </div>
        <div className="bg-slate-9 my-7 h-[0.5px] w-full" />
        <div className="my-3 flex items-center">
          <div className="text-blue-9 mb-[-3px] inline">
            <Icon icon="mdi:briefcase-outline" className="text-blue-9" width={20} height={20} />
          </div>
          <p className="m-0 pl-2">{employment}</p>
        </div>
        <div className="bg-slate-9 my-7 h-[0.5px] w-full" />
        <div className="my-3 flex items-center">
          <div className="text-blue-9 mb-[-3px] inline">
            <Icon icon="mdi:content-copy" className="text-blue-9" width={20} height={20} />
          </div>
          <p className="m-0 pl-2">{employment}</p>
        </div>
        <div className="bg-slate-9 mb-3 mt-7 h-[0.5px] w-full" />
        {applicationLink ? (
          <Link href={applicationLink}>
            <Button className="bg-blue-8 mt-3 w-20">Søk</Button>
          </Link>
        ) : (
          <div>ingen link</div>
        )}
      </div>
      <div className="w-2/3">
        <div className="border-amber-9 ml-8 mt-2 border-l-[1px] pl-4">
          <p className="m-0 text-4xl font-bold">{company.name}</p>
          <p className="m-0 text-3xl">{title}</p>
        </div>
        <div className="[&>*]:border-amber-9 mb-12 ml-8 flex flex-col gap-6 [&>*]:border-l-[1px] [&>*]:pl-4 [&>h2]:m-0 [&>h2]:border-b-0">
          {description}
        </div>
      </div>
    </div>
  )
}
