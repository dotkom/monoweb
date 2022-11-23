import { CareerAd, fetchCareerAd } from "@/api/get-career-ads"
import { Badge, Button, css, Text } from "@dotkomonline/ui"
import { IconArrowNarrowLeft, IconGlobe } from "@tabler/icons"
import { format } from "date-fns"
import Image from "next/image"
import { FC } from "react"
import { BsLinkedin, BsTwitter } from "react-icons/bs"
import { FaArrowLeft } from "react-icons/fa"
import { ImFacebook2 } from "react-icons/im"
import { IoEarth, IoTimeOutline, IoCopyOutline, IoArrowBackOutline } from "react-icons/io5"
import { MdWorkOutline } from "react-icons/md"

import PortableText from "@components/molecules/PortableText"

import { Flex } from "../primitives"

interface CareerAdViewProps {
  career: CareerAd
}

export const CareerAdView: FC<CareerAdViewProps> = (props: CareerAdViewProps) => {
  const {
    title,
    company_name,
    image,
    career_type,
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

        <div className={styles.infoTW}>
          <IconArrowNarrowLeft size={30} className="text-red-11 inline" />
          <Text className="m-0 pl-2 text-xl font-bold text-blue-500"> ANDRE MULIGHETER</Text>
        </div>

        <div className="bg-slate-9 my-7 h-[0.5px] w-full" />

        <div className={styles.infoTW}>
            <IconGlobe className="text-red-11" size={20} />
          <Text className="m-0 pl-2">{location}</Text>
        </div>

        <div className="bg-slate-9 my-7 h-[0.5px] w-full" />

        <div className={styles.infoTW}>
          <div className={styles.iconTW}>
            <IoTimeOutline />
          </div>
          <Text className="m-0 pl-2">{deadline}</Text>
        </div>

        <div className="bg-slate-9 my-7 h-[0.5px] w-full" />

        <div className={styles.infoTW}>
          <div className={styles.iconTW}>
            <MdWorkOutline />
          </div>
          <Text className="m-0 pl-2">{career_role}</Text>
        </div>

        <div className="bg-slate-9 my-7 h-[0.5px] w-full" />

        <div className={styles.infoTW}>
          <div className={styles.iconTW}>
            <IoCopyOutline />
          </div>
          <Text className="m-0 pl-2">{career_role}</Text>
        </div>

        <div className="bg-slate-9 my-7 h-[0.5px] w-full" />

        <div className="text-red-11 mt-2 ">
          {linkdin && (
            <a href={linkdin}>
              <BsLinkedin className="m-2" />
            </a>
          )}
          {twitter && (
            <a href={twitter}>
              <BsTwitter className="m-2" />
            </a>
          )}
          {facebook && (
            <a href={facebook}>
              <ImFacebook2 className="m-2" />
            </a>
          )}
        </div>
        <a href={link}>
          <Button className="bg-red-11 mt-3 w-20">Søk</Button>
        </a>
      </div>
      <div className="w-2/3">
        <div className={styles.articleTW}>
          <Text className="m-0 text-2xl">
            <b>{company_name}</b>
          </Text>
          <Text className="m-0 text-2xl ">{title}</Text>
        </div>
        <PortableText
          blocks={content}
          className="[&>*]:border-l-1.5 ml-50 [&>*]border-amber-9 mt-4 pl-4 [&>h1]:text-5xl"
        />
      </div>
    </div>
  )
}
// from css to tailwind
const styles = {
  article: {
    borderLeft: "1.5px solid $orange3",
    pl: "$4",
    ml: "50px",
    mt: "$4",
  },
  articleTW: "border-l-1.5 border-amber-9 pl-4 ml-50 mt-4",
  portable: {
    borderLeft: "1.5px solid $orange3",
    pl: "$4",
    ml: "50px",
    mt: "$4",
  },
  portableTW: "border-l-1.5 border-orange3 pl-4 ml-50 mt-4",
  info: {
    display: "flex",
    margin: "0px",
    my: "$3",
    alignItems: "center",
  },
  infoTW: "flex my-3 items-center",
  icon: {
    display: "inline",
    color: "$blue2",
    mb: "-3px",
  },
  iconTW: "inline text-red-11 mb-[-3px]",
  content: css({
    "h1, ul, p, h2": {
      borderLeft: "1.5px solid $orange3",
      pl: "$4",
      ml: "50px",
      mt: "$4",
    },
    h1: {
      fontSize: "20px",
    },
  }),
}
