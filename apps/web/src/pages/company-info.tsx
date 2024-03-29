import { type GetServerSideProps } from "next"
import { type FC } from "react"
import { CompanyInfoView, type Content } from "@/components/views/CompanyInfoView"
import { fetchCompanySectionData } from "@/api/get-company-page"

interface CompanyProps {
  sections: Content[]
}

export const getServerSideProps: GetServerSideProps = async () => {
  const data = await fetchCompanySectionData()
  return { props: { sections: data } }
}
const Company: FC<CompanyProps> = (props: CompanyProps) => <CompanyInfoView companyInfoContent={props.sections} />

export default Company
