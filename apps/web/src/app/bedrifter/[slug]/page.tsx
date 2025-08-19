import { server } from "@/utils/trpc/server"
import { CompanyView } from "../CompanyView"

interface CompanyPageProps {
  params: Promise<{ slug: string }>
}

const CompanyPage = async ({ params }: CompanyPageProps) => {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)

  const company = await server.company.getBySlug.query(slug)

  return <CompanyView company={company} />
}

export default CompanyPage
