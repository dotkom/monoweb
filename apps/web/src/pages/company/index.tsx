import Link from "next/link"
import { trpc } from "@/utils/trpc"

const CompanyPage = () => {
  const { data, isLoading } = trpc.company.all.useQuery()

  if (isLoading) {return <p>Loading...</p>}

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
