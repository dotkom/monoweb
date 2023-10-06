import { CompanyInfoView, type Content } from "@/components/views/CompanyInfoView";
import { type GetServerSideProps } from "next";
import { type FC } from "react";
import { fetchCompanySectionData } from "src/api/get-company-page";

interface CompanyProps {
  sections: Array<Content>;
}

export const getServerSideProps: GetServerSideProps = async () => {
  const data = await fetchCompanySectionData();

  return { props: { sections: data } };
};

const Company: FC<CompanyProps> = (props: CompanyProps) => <CompanyInfoView companyInfoContent={props.sections} />;

export default Company;
