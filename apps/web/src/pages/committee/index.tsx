import { trpc } from "@/utils/trpc"
import Link from "next/link"

const CommitteePage = () => {
  const { data, isLoading } = trpc.committee.all.useQuery()

  if (isLoading) return <p>Loading...</p>

  return (
    <ul className="text-blue-11 text-center text-2xl">
      {data?.map((committee) => (
        <li className="text-blue-11 hover:text-blue-9 cursor-pointer" key={committee.id}>
          <Link href={`committee/${committee.id}`}>{committee.name}</Link>
        </li>
      ))}
    </ul>
  )
}

export default CommitteePage
