import { trpc } from "@/utils/trpc"
import Link from "next/link"

const CompanyPage = () => {
    const { data, isLoading } = trpc.company.all.useQuery()

    if (isLoading) return <p>Loading...</p>

    return (
        <ul className="text-2xl text-center text-blue-11">
            {data?.map((company) => (
                <li className="text-blue-11 hover:text-blue-9 cursor-pointer" key={company.id}>
                    <Link href={`company/${company.id}`}>{company.name}</Link>
                </li>
            ))}
        </ul>
    )
}

export default CompanyPage