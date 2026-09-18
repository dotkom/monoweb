import { server } from "@/utils/trpc/server"
import { CompanyView } from "../CompanyView"
import { notFound } from "next/navigation"

interface CompanyPageProps {
  params: Promise<{ slug: string }>
}

const CompanyPage = async ({ params }: CompanyPageProps) => {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(rawSlug)

  const company = await server.company.findBySlug.query(slug)

  if (!company) {
    notFound()
  }

  return <CompanyView company={company} />
}

export default CompanyPage
