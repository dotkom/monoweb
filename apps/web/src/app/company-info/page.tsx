import { fetchCompanySectionData } from "@/api/get-company-page"
import { CompanyInfoView } from "@/components/views/CompanyInfoView"

const Company = async () => {
  const companyData = await fetchCompanySectionData()
  // @ts-expect-error
  return <CompanyInfoView companyInfoContent={companyData} />
}

export default Company
