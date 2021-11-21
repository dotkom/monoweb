import { BlockContentProps } from "@sanity/block-content-to-react";
import React, { FC } from "react";
import { Box } from "theme-ui";
import { CompanyHeader } from "./CompanyHeader";
import { CompanyInfo } from "./CompanyInfo";
import { CompanyInterestForm } from "./CompanyInterest";
import { CompanyMap } from "./CompanyMap";
import { CompanyMore } from "./CompanyMore";
import { CompanyProducts } from "./CompanyProduct";

type Content = BlockContentProps["blocks"];

interface CompanyViewProps {
  content: Content[];
}

export const CompanyView: FC<CompanyViewProps> = (props: CompanyViewProps) => {
  const [headerContent, interestContent, productContent, infoContent, additionalContent] = props.content;
  return (
    <Box
      sx={{
        bg: "white",
        display: "flex",
        flexDirection: "column",

        width: "100%",
        margin: "auto",
        // set this to `minHeight: '100vh'` for full viewport height
      }}
    >
      <CompanyHeader content={headerContent} />
      <CompanyInterestForm content={interestContent} />
      <CompanyProducts content={productContent} />
      <CompanyMap />
      <CompanyInfo content={infoContent} />
      <CompanyMore content={additionalContent} />
    </Box>
  );
};

export default CompanyView;
