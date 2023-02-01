import { CareerAd } from "@/api/get-career-ads"
import { Button, Text } from "@dotkomonline/ui"
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

        <Text>{company_info}</Text>

        <div className="bg-slate-12 mx-auto mt-10 mb-14 h-[0.5px] w-full" />

        <div className={"my-3 flex items-center"}>
          <BsArrowLeft size={20} className="text-blue-9 inline" />
          <Text className="m-0 pl-2 text-xl font-bold text-blue-500"> ANDRE MULIGHETER</Text>
        </div>

        <div className="bg-slate-9 my-7 h-[0.5px] w-full" />

        <div className={"my-3 flex items-center"}>
          <TbGlobe className="text-blue-9" size={20} />
          <Text className="m-0 pl-2">{location}</Text>
        </div>

        <div className="bg-slate-9 my-7 h-[0.5px] w-full" />

        <div className={"my-3 flex items-center"}>
          <div className={"text-blue-9 mb-[-3px] inline"}>
            <IoTimeOutline />
          </div>
          <Text className="m-0 pl-2">{deadline}</Text>
        </div>

        <div className="bg-slate-9 my-7 h-[0.5px] w-full" />

        <div className={"my-3 flex items-center"}>
          <div className={"text-blue-9 mb-[-3px] inline"}>
            <MdWorkOutline />
          </div>
          <Text className="m-0 pl-2">{career_role}</Text>
        </div>

        <div className="bg-slate-9 my-7 h-[0.5px] w-full" />

        <div className={"my-3 flex items-center"}>
          <div className={"text-blue-9 mb-[-3px] inline"}>
            <IoCopyOutline />
          </div>
          <Text className="m-0 pl-2">{career_role}</Text>
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
        <div className={"border-amber-9 ml-8 mt-2 border-l-[1px] pl-4"}>
          <Text className="m-0 text-4xl">
            <b>{company_name}</b>
          </Text>
          <Text className="m-0 text-3xl ">{title}</Text>
        </div>
        <PortableText
          blocks={content}
          className="[&>*]:border-amber-9 [&>*]:text-amber-12 my-12 ml-8 [&>*]:border-l-[1px] [&>*]:pl-8"
        />
      </div>
    </div>
  )
}
