import { GetServerSideProps } from "next"
import { FC } from "react"
import { fetchCompanySectionData } from "src/api/get-company-page"

import { CompanyView, Content } from "@components/views/CompanyView/index"

interface CompanyProps {
  sections: Content
}

export const getServerSideProps: GetServerSideProps = async () => {
  const data = await fetchCompanySectionData()
  return { props: { sections: data } }
}
const Company: FC<CompanyProps> = (props: CompanyProps) => {
  if (!props.sections) {
    return null
  }
  return <CompanyView companyContent={props.sections} />
}

export default Company
