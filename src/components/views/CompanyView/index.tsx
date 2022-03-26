import Button from "@components/atoms/Button/Button";
import PortableText from "@components/molecules/PortableText";
import { Box, SpanBox } from "@components/primitives";
import Text from "@components/atoms/Text";
import { BlockContentProps } from "@sanity/block-content-to-react";
import { CSS, css, createStyles } from "@theme";
import { VFC } from "react";
import CompanyInterestProcess from "./CompanyInterestProcess";
import OurProducts from "./OurProducts";

export type Content = BlockContentProps["blocks"];

interface CompanyViewProps {
  companyContent: Content[];
}
export const CompanyView: VFC<CompanyViewProps> = (props: CompanyViewProps) => {
  const [header, interest, product, info, contact] = props.companyContent;

  return (
    <Box css={{ margin: "auto", maxWidth: "1024px" }}>
      <Box css={{ bg: "$orange12", fullWidth: true }}>
        <Box css={styles.banner}>
          <Text as="h1" css={styles.bannerTitle}>
            Er din bedrift på jakt etter skarpe IT-<SpanBox css={styles.yellowUnderline}>studenter?</SpanBox>
          </Text>
          <PortableText blocks={header.content} />
        </Box>
      </Box>
      <Box css={styles.interest}>
        <PortableText blocks={interest.content} css={styles.interestContent} />
        <a href="https://interesse.online.ntnu.no">
          <Button css={styles.button}>Send Interesse</Button>
        </a>
      </Box>
      <PortableText blocks={product.content} css={styles.products} />
      <OurProducts />
      <Box css={{ bg: "$bluebg", fullWidth: true }}>
        <CompanyInterestProcess steps={["Kartlegging", "Intern Planlegging", "Tilbud", "Sammarbeid"]} />
      </Box>
      <PortableText blocks={info.content} css={styles.info} />
      <PortableText blocks={contact.content} css={styles.contact} />
    </Box>
  );
};

const styles = createStyles({
  banner: {
    maxWidth: "$md",
    margin: "auto",
    padding: "$4",
    fontSize: "$md",
  },
  bannerTitle: {
    color: "$gray1",
    marginBottom: "$4",
    fontSize: "$4xl",
    lineHeight: "1.4",
  },
  yellowUnderline: {
    backgroundImage: 'url("/for-company-text-decor.svg")',
    backgroundRepeat: "no-repeat",
    backgroundPosition: "50% 88%",
  },
  interest: {
    marginTop: "$5",
    textAlign: "center",
    px: "$3",
  },
  interestContent: {
    "& > h2": {
      fontSize: "$2xl",
      marginBottom: "$3",
    },
    "& > p": {
      margin: "$4 auto",
      maxWidth: "25rem",
      fontSize: "$sm",
    },
  },
  button: {
    fontSize: "$lg",
    minWidth: "200px",
  },
  products: {
    margin: "$5 auto",
    maxWidth: "$md",
    textAlign: "center",
    "& > h2": {
      marginBottom: "$3",
    },
    px: "$2",
  },
  info: {
    alignSelf: "center",
    padding: "$4",
    h2: { color: "$gray1", marginTop: "$5", marginBottom: "$1", fontSize: 24, fontWeight: "bold" },
    p: { marginTop: 3, fontSize: 14 },
  },
  contact: {
    my: "$6",
    textAlign: "center",
    padding: "$3",
    h3: { fontSize: "$2xl", marginBottom: "$2", textAlign: "center", fontWeight: 600 },
    p: { fontSize: "$md" },
  },
});

export default CompanyView;
