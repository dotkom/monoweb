import { BlockContentProps } from "@sanity/block-content-to-react";
import React, { FC } from "react";
import { Box } from "theme-ui";
import { CompanyHeader } from "./CompanyHeader";
import { CompanyInfo } from "./CompanyInfo";
import { CompanyInterestForm } from "./CompanyInterest";
import { CompanyMap } from "./CompanyMap";
import { CompanyMore } from "./CompanyMore";
import { CompanyProducts } from "./CompanyProduct";

export type Content = BlockContentProps["blocks"];

interface CompanyViewProps {
  companyContent: Content[];
}
export interface SectionProps {
  content: Content;
}

export const CompanyView: FC<CompanyViewProps> = (props: CompanyViewProps) => {
  const [header, interest, product, info, additional] = props.companyContent;
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
      <CompanyHeader content={header.content} />
      <CompanyInterestForm content={interest.content} />
      <CompanyProducts content={product.content} />
      <CompanyMap />
      <CompanyInfo content={info.content} />
      <CompanyMore content={additional.content} />
    </Box>
  );
};

export default CompanyView;
