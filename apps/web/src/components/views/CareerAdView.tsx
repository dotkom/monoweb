import { Box, Flex } from "../primitives"
import { CSS } from "@theme"
import PortableText from "@components/molecules/PortableText"
import Image from "next/image"
import { DateTime } from "luxon"
import { Badge, Button, css, Text } from "@dotkom/ui"
import { IoEarth, IoTimeOutline, IoCopyOutline, IoArrowBackOutline } from "react-icons/io5"
import { BsLinkedin, BsTwitter } from "react-icons/bs"
import { ImFacebook2 } from "react-icons/im"
import { FaArrowLeft } from "react-icons/fa"
import { CareerAd, fetchCareerAd } from "@/api/get-career-ads"
import { FC } from "react"
import { MdWorkOutline } from "react-icons/md"

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
    <Flex
      css={{
        mt: "100px",
        width: "80%",
        display: "flex",
        mx: "auto",
        justifyContent: "space-around",
      }}
    >
      <Box
        css={{
          width: "30%",
        }}
      >
        <Box css={{ position: "relative", width: "100%", height: "200px" }}>
          <Image layout="fill" src={image.asset.url} alt="company_image" />
        </Box>

        <Text>{company_info}</Text>

        <Box
          css={{
            mt: "$4",
            mb: "$5",
            mx: "auto",
            width: "100%",
            borderBottom: "1px solid black",
          }}
        />

        <Box css={styles.info}>
          <Box css={{ display: "inline", color: "$blue2", fontSize: "15px", mb: "-3px" }}>
            <FaArrowLeft />
          </Box>
          <Text css={{ margin: "0", fontWeight: "bold", fontSize: "15px", color: "$blue2", pl: "$2" }}>
            {" "}
            ANDRE MULIGHETER
          </Text>
        </Box>

        <Box css={{ width: "100%", borderBottom: "1px solid $gray8" }} />

        <Box css={styles.info}>
          <Box css={styles.icon}>
            <IoEarth />
          </Box>
          <Text css={{ margin: "0", pl: "$2" }}>{location}</Text>
        </Box>

        <Box css={{ width: "100%", borderBottom: "1px solid $gray8" }} />

        <Box css={styles.info}>
          <Box css={styles.icon}>
            <IoTimeOutline />
          </Box>
          <Text css={{ margin: "0", pl: "$2" }}>{DateTime.fromISO(deadline).toFormat("dd.MM.yyyy")}</Text>
        </Box>

        <Box css={{ width: "100%", borderBottom: "1px solid $gray8" }} />

        <Box css={styles.info}>
          <Box css={styles.icon}>
            <MdWorkOutline />
          </Box>
          <Text css={{ margin: "0", pl: "$2" }}>{career_type}</Text>
        </Box>

        <Box css={{ width: "100%", borderBottom: "1px solid $gray8" }} />

        <Box css={styles.info}>
          <Box css={styles.icon}>
            <IoCopyOutline />
          </Box>
          <Text css={{ margin: "0", pl: "$2" }}>{career_role}</Text>
        </Box>

        <Box css={{ width: "100%", borderBottom: "1px solid $gray8" }} />

        <Box css={{ color: "$blue2", mt: "$2" }}>
          {linkdin && <a style={{textDecoration:"none"}} href={linkdin}><BsLinkedin style={{ margin: "5px" }} /></a>}
          {twitter && <a style={{textDecoration:"none"}} href={twitter}><BsTwitter style={{ margin: "5px" }} /></a>}
          {facebook && <a style={{textDecoration:"none"}} href={facebook}><ImFacebook2 style={{ margin: "5px" }} /></a>}
        </Box>
        <a href={link}>
          <Button css={{ mt: "$3", width: "80px" }}>Søk</Button>
        </a>
      </Box>
      <Box
        css={{
          width: "60%",
        }}
      >
        <Box css={styles.article}>
          <Text css={{ margin: "0", fontSize: "30px" }}>
            <b>{company_name}</b>
          </Text>
          <Text css={{ margin: "0", fontSize: "20px" }}>{title}</Text>
        </Box>
        <PortableText blocks={content} className={styles.content()} />
      </Box>
    </Flex>
  )
}

const styles = {
  article: {
    borderLeft: "1.5px solid $orange3",
    pl: "$4",
    ml: "50px",
    mt: "$4",
  } as CSS,
  portable: {
    borderLeft: "1.5px solid $orange3",
    pl: "$4",
    ml: "50px",
    mt: "$4",
  } as CSS,
  info: {
    display: "flex",
    margin: "0px",
    my: "$3",
    alignItems: "center",
  } as CSS,
  icon: {
    display: "inline",
    color: "$blue2",
    mb: "-3px",
  } as CSS,
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
