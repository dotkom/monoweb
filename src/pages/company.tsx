import { CompanyView } from "@components/views/CompanyView/index";
import { GetServerSideProps } from "next";
import React, { FC } from "react";
import { fetchCompanySectionData } from "src/api/get-company-page";

interface CompanyProps {
  sections: [Record<string, unknown>];
}

export const getServerSideProps: GetServerSideProps = async () => {
  const data = await fetchCompanySectionData();
  return { props: { sections: data } };
};
const Company: FC<CompanyProps> = (props: CompanyProps) => {
  return <CompanyView content={props.sections} />;
};

export default Company;
