import { getServerClient } from "@/utils/trpc/serverClient"
import Link from "next/link"

const CompanyPage = async () => {
  const serverClient = await getServerClient()
  const data = await serverClient.company.all()

  return (
    <ul className="text-blue-11 text-center text-2xl">
      {data?.map((company) => (
        <li className="text-blue-11 hover:text-blue-9 cursor-pointer" key={company.id}>
          <Link href={`company/${company.id}`}>{company.name}</Link>
        </li>
      ))}
    </ul>
  )
}

export default CompanyPage
