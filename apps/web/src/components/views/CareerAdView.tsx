import { CareerAd, fetchCareerAd } from "@/api/get-career-ads"
import { Badge, Button, css, Text } from "@dotkomonline/ui"
import { DateTime } from "luxon"
import Image from "next/image"
import { FC } from "react"
import { BsLinkedin, BsTwitter } from "react-icons/bs"
import { FaArrowLeft } from "react-icons/fa"
import { ImFacebook2 } from "react-icons/im"
import { IoEarth, IoTimeOutline, IoCopyOutline, IoArrowBackOutline } from "react-icons/io5"
import { MdWorkOutline } from "react-icons/md"

import PortableText from "@components/molecules/PortableText"

import { Box, Flex } from "../primitives"

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
    <Flex className="mx-auto mt-10 flex w-10/12 justify-around">
      <Box className="w-1/3">
        <Box className="relative">
          <Image src={image.asset.url} width={200} height={200} alt="company_image" />
        </Box>

        <Text>{company_info}</Text>

        <Box className="border-b-1 mx-auto mt-4 mb-5 w-full border-black" />

        <Box className={styles.infoTW}>
          <Box className="mb-1 inline text-xl text-red-11">
            <FaArrowLeft />
          </Box>
          <Text className="m-0 pl-2 text-xl font-bold text-blue-500"> ANDRE MULIGHETER</Text>
        </Box>

        <Box className="border-b-1 w-full border-black" />

        <Box className={styles.infoTW}>
          <Box className={styles.iconTW}>
            <IoEarth />
          </Box>
          <Text className="m-0 pl-2">{location}</Text>
        </Box>

        <Box className="border-b-1 w-full border-black" />

        <Box className={styles.infoTW}>
          <Box className={styles.iconTW}>
            <IoTimeOutline />
          </Box>
          <Text className="m-0 pl-2">{DateTime.fromISO(deadline).toFormat("dd.MM.yyyy")}</Text>
        </Box>

        <Box className="border-b-1 w-full border-black" />

        <Box className={styles.infoTW}>
          <Box className={styles.iconTW}>
            <MdWorkOutline />
          </Box>
          <Text className="m-0 pl-2">{career_role}</Text>
        </Box>

        <Box className="border-b-1 w-full border-black" />

        <Box className={styles.infoTW}>
          <Box className={styles.iconTW}>
            <IoCopyOutline />
          </Box>
          <Text className="m-0 pl-2">{career_role}</Text>
        </Box>

        <Box className="border-b-1 w-full border-black" />

        <Box className="mt-2 text-red-11">
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
        </Box>
        <a href={link}>
          <Button className="mt-3 w-20">Søk</Button>
        </a>
      </Box>
      <Box className="w-2/3">
        <Box className={styles.articleTW}>
          <Text className="m-0 text-2xl">
            <b>{company_name}</b>
          </Text>
          <Text className="m-0 text-2xl">{title}</Text>
        </Box>
        <PortableText
          blocks={content}
          className="[&>*]:border-l-1.5 ml-50 [&>*]border-amber-9 mt-4 pl-4 [&>h1]:text-2xl"
        />
      </Box>
    </Flex>
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
  iconTW: "inline text-red-11 mb-3",
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
