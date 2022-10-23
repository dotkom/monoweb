import PortableText from "@components/molecules/PortableText"
import { Box } from "@components/primitives"
import { BlockContentProps } from "@sanity/block-content-to-react"
import { CSS, css, styled } from "@dotkomonline/ui"
import { FC } from "react"
import CompanyInterestProcess from "./CompanyInterestProcess"
import OurProducts from "./OurProducts"
import { Button } from "@dotkomonline/ui"

export type Content = BlockContentProps["blocks"]

interface CompanyViewProps {
  companyContent: Content[]
}
export const CompanyView: FC<CompanyViewProps> = (props: CompanyViewProps) => {
  const [header, interest, product, info, contact] = props.companyContent

  return (
    <Box css={{ margin: "auto", maxWidth: "1024px" }}>
      <Box css={{ bg: "$orange12", fullWidth: true }}>
        <Box css={styles.banner}>
          <h1 className={styles.bannerTitle()}>
            Er din bedrift på jakt etter skarpe IT-<span className={styles.yellowUnderline()}>studenter?</span>
          </h1>
          <PortableText blocks={header.content} />
        </Box>
      </Box>
      <Box css={styles.interest}>
        <Interest blocks={interest.content} />
        <a href="https://interesse.online.ntnu.no">
          <Button css={styles.button}>Send Interesse</Button>
        </a>
      </Box>
      <Product blocks={product.content} />
      <OurProducts />
      <Box css={{ bg: "$bluebg", fullWidth: true }}>
        <CompanyInterestProcess steps={["Kartlegging", "Intern Planlegging", "Tilbud", "Sammarbeid"]} />
      </Box>
      <Info blocks={info.content} />
      <Contact blocks={contact.content} />
    </Box>
  )
}

const styles = {
  banner: {
    height: "300px",
    maxWidth: "$md",
    margin: "auto",
    padding: "$4",
    fontSize: "$md",
    "@media only screen and (max-width: 550px)": {
      height: "400px",
    },
    "@media only screen and (max-width: 400px)": {
      height: "520px",
    },
  } as CSS,
  bannerTitle: css({
    color: "$gray1",
    marginBottom: "$4",
    fontSize: "$4xl",
    lineHeight: "1.4",
    marginTop: "$5",
  }),
  yellowUnderline: css({
    backgroundImage: 'url("/for-company-text-decor.svg")',
    backgroundRepeat: "no-repeat",
    backgroundPosition: "50% 88%",
  }),
  interest: {
    marginTop: "$5",
    textAlign: "center",
    px: "$3",
  } as CSS,
  interestContent: css({
    "& > h2": {
      fontSize: "$2xl",
      marginBottom: "$3",
    },
    "& > p": {
      margin: "$4 auto",
      maxWidth: "25rem",
      fontSize: "$sm",
    },
  }),
  button: {
    fontSize: "$lg",
    minWidth: "200px",
  } as CSS,
  products: css({
    margin: "$5 auto",
    maxWidth: "$md",
    textAlign: "center",
    "& > h2": {
      marginBottom: "$3",
    },
    px: "$2",
  }),
  info: css({
    alignSelf: "center",
    padding: "$4",
    h2: { color: "$gray1", marginTop: "$5", marginBottom: "$1", fontSize: 24, fontWeight: "bold" },
    p: { marginTop: 3, fontSize: 14 },
  }),
  contact: css({
    my: "$6",
    textAlign: "center",
    padding: "$3",
    h3: { fontSize: "$2xl", marginBottom: "$2", textAlign: "center", fontWeight: 600 },
    p: { fontSize: "$md" },
  }),
}

const Interest = styled(PortableText, styles.interestContent)
const Product = styled(PortableText, styles.products)
const Info = styled(PortableText, styles.info)
const Contact = styled(PortableText, styles.contact)

export default CompanyView
