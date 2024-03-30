import { CompanyInfoView, type Content } from "@/components/views/CompanyInfoView"
import { fetchCompanySectionData } from "@/api/get-company-page"

const getServerSideProps = async () => {
  const data = await fetchCompanySectionData()
  return { sections: data }
}
const Company = async () => {
  const props = await getServerSideProps()
  // @ts-ignore
  return <CompanyInfoView companyInfoContent={props.sections} />
}

export default Company
