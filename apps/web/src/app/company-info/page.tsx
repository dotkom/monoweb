import { CompanyInfoView, type Content } from "@/components/views/CompanyInfoView"
import { fetchCompanySectionData } from "@/api/get-company-page"

const Company = async () => {
  const companyData = await fetchCompanySectionData()
  // @ts-expect-error
  return <CompanyInfoView companyInfoContent={companyData} />
}

export default Company
