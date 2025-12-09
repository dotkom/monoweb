import Link from "next/link"
import { server } from "@/utils/trpc/server"

const CompanyPage = async () => {
  const data = await server.company.all.query()

  return (
    <ul className="text-blue-950 text-center text-2xl">
      {data?.map((company) => (
        <li className="text-blue-950 hover:text-blue-800 cursor-pointer" key={company.id}>
          <Link href={`bedrifter/${company.slug}`}>{company.name}</Link>
        </li>
      ))}
    </ul>
  )
}

export default CompanyPage
