import Button from "@components/atoms/Button";
import PortableText from "@components/molecules/PortableText";
import Box from "@components/particles/Box";
import { BlockContentProps } from "@sanity/block-content-to-react";
import { css } from "@theme";
import { VFC } from "react";
import CompanyInterestProcess from "./CompanyInterestProcess";

export type Content = BlockContentProps["blocks"];

interface CompanyViewProps {
  companyContent: Content[];
}
export interface SectionProps {
  content: Content;
}

export const CompanyView: VFC<CompanyViewProps> = (props: CompanyViewProps) => {
  const [header, interest, product, info, contact] = props.companyContent;
  return (
    <Box css={{ margin: "auto", maxWidth: "1024px" }}>
      <Box css={{ bg: "$orange12", fullWidth: true }}>
        <Box className={styles.banner()}>
          <h1 className={styles.bannerTitle()}>
            Er din bedrift på jakt etter skarpe IT-<span className={styles.yellowUnderline()}>studenter?</span>
          </h1>
          <PortableText blocks={header.content} />
        </Box>
      </Box>
      <Box className={styles.interest()}>
        <PortableText blocks={interest.content} className={styles.interestContent()} />
        <Button className={styles.button()}>Send Interesse</Button>
      </Box>
      <PortableText blocks={product.content} className={styles.products()} />
      <Box css={{ bg: "$bluebg", fullWidth: true }}>
        <CompanyInterestProcess steps={["Kartlegging", "Intern Planlegging", "Tilbud", "Sammarbeid"]} />
      </Box>
      <PortableText blocks={info.content} className={styles.info()} />
      <PortableText blocks={contact.content} className={styles.contact()} />
    </Box>
  );
};

const styles = {
  info: css({
    alignSelf: "center",
    padding: 60,
    h2: { color: "gray.1", marginTop: "$5", marginBottom: "$1", fontSize: 24, fontWeight: "bold" },
    p: { marginTop: 3, fontSize: 14 },
  }),
  banner: css({
    maxWidth: "$md",
    margin: "auto",
    padding: "$4",
    fontSize: "$md",
  }),
  bannerTitle: css({
    color: "gray.1",
    marginBottom: "$4",
    fontSize: "$4xl",
    lineHeight: "1.4",
  }),
  yellowUnderline: css({
    backgroundImage: 'url("/for-company-text-decor.svg")',
    backgroundRepeat: "no-repeat",
    backgroundPosition: "50% 88%",
  }),
  interest: css({
    marginTop: "$5",
    textAlign: "center",
    px: "$3",
  }),
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
  button: css({
    fontSize: "$lg",
    minWidth: "200px",
  }),
  products: css({
    margin: "$5 auto",
    maxWidth: "$md",
    textAlign: "center",
    "& > h2": {
      marginBottom: "$3",
    },
    px: "$2",
  }),
  contact: css({
    my: "$6",
    textAlign: "center",
    padding: "$3",
    h3: { fontSize: "$2xl", marginBottom: "$2", textAlign: "center", fontWeight: 600 },
    p: { fontSize: "$md" },
  }),
};

export default CompanyView;
