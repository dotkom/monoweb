import { CareerAd } from "@/api/get-career-ads"
import { Button } from "@dotkomonline/ui"
import Image from "next/image"
import { FC } from "react"
import { BsLinkedin, BsTwitter, BsArrowLeft } from "react-icons/bs"
import { ImFacebook2 } from "react-icons/im"
import { IoTimeOutline, IoCopyOutline } from "react-icons/io5"
import { MdWorkOutline } from "react-icons/md"
import { TbGlobe } from "react-icons/tb"
import PortableText from "@components/molecules/PortableText"

interface CareerAdViewProps {
  career: CareerAd
}

export const CareerAdView: FC<CareerAdViewProps> = (props: CareerAdViewProps) => {
  const {
    title,
    company_name,
    image,
    location,
    deadline,
    company_info,
    content,
    link,
    linkdin,
    twitter,
    facebook,
    career_role,
  } = props.career

  return (
    <div className="mx-auto mt-10 flex w-10/12 justify-between">
      <div className="w-1/3">
        <div className="relative pb-10">
          <Image src={image.asset.url} width={4000} height={250} alt="company_image" />
        </div>

        <p>{company_info}</p>

        <div className="bg-slate-12 mx-auto mt-10 mb-14 h-[0.5px] w-full" />
        <a href="/career">
          <div className="flex items-center">
            <BsArrowLeft size={20} className="text-blue-9 mb-2 inline" />
            <h2 className="m-0 border-0 pl-2 text-base text-blue-500"> ANDRE MULIGHETER</h2>
          </div>
        </a>
        <div className="bg-slate-9 mb-7 mt-3 h-[0.5px] w-full" />
        <div className="my-3 flex items-center">
          <TbGlobe className="text-blue-9" size={20} />
          <p className="m-0 pl-2">{location}</p>
        </div>
        <div className="bg-slate-9 my-7 h-[0.5px] w-full" />
        <div className="my-3 flex items-center">
          <div className="text-blue-9 mb-[-3px] inline">
            <IoTimeOutline />
          </div>
          <p className="m-0 pl-2">{deadline}</p>
        </div>
        <div className="bg-slate-9 my-7 h-[0.5px] w-full" />
        <div className="my-3 flex items-center">
          <div className="text-blue-9 mb-[-3px] inline">
            <MdWorkOutline />
          </div>
          <p className="m-0 pl-2">{career_role}</p>
        </div>
        <div className="bg-slate-9 my-7 h-[0.5px] w-full" />
        <div className="my-3 flex items-center">
          <div className="text-blue-9 mb-[-3px] inline">
            <IoCopyOutline />
          </div>
          <p className="m-0 pl-2">{career_role}</p>
        </div>
        <div className="bg-slate-9 mt-7 mb-3 h-[0.5px] w-full" />
        <div className="text-blue-9">
          {linkdin && (
            <a href={linkdin}>
              <BsLinkedin className="m-1 inline-block" />
            </a>
          )}
          {twitter && (
            <a href={twitter}>
              <BsTwitter className="m-1 inline-block" />
            </a>
          )}
          {facebook && (
            <a href={facebook}>
              <ImFacebook2 className="m-1 inline-block" />
            </a>
          )}
        </div>
        <a href={link}>
          <Button className="bg-blue-8 mt-3 w-20">Søk</Button>
        </a>
      </div>
      <div className="w-2/3">
        <div className="border-amber-9 ml-8 mt-2 border-l-[1px] pl-4">
          <p className="m-0 text-4xl font-bold">{company_name}</p>
          <p className="m-0 text-3xl">{title}</p>
        </div>
        <div className="[&>*]:border-amber-9 mb-12 ml-8 flex flex-col gap-6 [&>*]:border-l-[1px] [&>*]:pl-4 [&>h2]:m-0 [&>h2]:border-b-0">
          <PortableText blocks={content} />
        </div>
      </div>
    </div>
  )
}
