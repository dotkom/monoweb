import { CompanyView } from "@components/views/CompanyView";
import { GetServerSideProps, GetStaticProps } from "next";
import React from "react";
import { fetchCompanySectionData } from "src/api/get-company-page";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const data = await fetchCompanySectionData();
  return { props: { sections: data } };
};
const Company: React.FC = (props) => {
  console.log(props.sections);
  return <CompanyView content={props.sections} />;
};

export default Company;
