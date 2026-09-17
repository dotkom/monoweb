import { server } from "@/utils/trpc/server"
import Link from "next/link"

const CompanyPage = async () => {
  const data = await server.company.findMany.query({ take: 1000, filter: {} })
  const companies = data?.items ?? []

  return (
    <ul className="text-blue-950 text-center text-2xl">
      {companies.map((company) => (
        <li className="text-blue-950 hover:text-blue-800 cursor-pointer" key={company.id}>
          <Link href={`bedrifter/${company.slug}`}>{company.name}</Link>
        </li>
      ))}
    </ul>
  )
}

export default CompanyPage
