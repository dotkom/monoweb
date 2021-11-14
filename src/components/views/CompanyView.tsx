import { Box } from "theme-ui";
import { CompanyInfo } from "../organisms/companies/CompanyInfo";
import { CompanyMap } from "../organisms/companies/CompanyMap";
import { CompanyMore } from "../organisms/companies/CompanyMore";
import { CompanyProducts } from "../organisms/companies/CompanyProduct";
import { CompanyInterestForm } from "../organisms/companies/CompanyInterest";
import { CompanyHeader } from "../organisms/companies/CompanyHeader";

interface CompanyViewProps {
  content: any[];
}

export const CompanyView = (props: CompanyViewProps) => {
  return (
    <Box
      sx={{
        bg: "white",
        display: "flex",
        flexDirection: "column",
        maxWidth: "1048px",
        width: "100%",
        margin: "auto",
        // set this to `minHeight: '100vh'` for full viewport height
      }}
    >
      <CompanyHeader content={props.content[0]} />
      <CompanyInterestForm content={props.content[1]} />
      <CompanyProducts content={props.content[2]} />
      {/* <CompanyMap /> */}
      <CompanyInfo content={props.content[3]} />
      <CompanyMore content={props.content[4]} />
    </Box>
  );
};
