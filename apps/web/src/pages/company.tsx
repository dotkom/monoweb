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
  // return <CompanyView companyContent={props.sections} />

  return <div>{JSON.stringify(props.sections, null, 2)}</div>
}

export default Company
