import { CompanyView, Content } from "@components/views/CompanyView/index";
import { GetServerSideProps } from "next";
import React, { FC } from "react";
import { fetchCompanySectionData } from "src/api/get-company-page";

interface CompanyProps {
  sections: Content;
}

export const getServerSideProps: GetServerSideProps = async () => {
  const data = await fetchCompanySectionData();
  return { props: { sections: data } };
};
const Company: FC<CompanyProps> = (props: CompanyProps) => {
  return <CompanyView companyContent={props.sections} />;
};

export default Company;
