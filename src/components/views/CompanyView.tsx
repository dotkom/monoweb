import { Box } from "theme-ui";
import { CompanyInfo } from "../organisms/companies/CompanyInfo";
import { CompanyMap } from "../organisms/companies/CompanyMap";
import { CompanyMore } from "../organisms/companies/CompanyMore";
import { CompanyProducts } from "../organisms/companies/CompanyProduct";
import { CompanyInterestForm } from "../organisms/companies/CompanyInterest";
import { CompanyHeader } from "../organisms/companies/CompanyHeader";

export const CompanyView = (props: [Record<string, unknown>]) => {
  return (
    <Box
      sx={{
        bg: "white",
        display: "flex",
        flexDirection: "column",
        // set this to `minHeight: '100vh'` for full viewport height
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <CompanyHeader props={props} />
      <CompanyInterestForm />
      <CompanyProducts />
      <CompanyMap />
      <CompanyInfo props={props} />
      <CompanyMore />
    </Box>
  );
};
