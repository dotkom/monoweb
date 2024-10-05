import { server } from "@/utils/trpc/server"
import Link from "next/link"

const CommitteePage = async () => {
  const committees = await server.committee.all.query()

  return (
    <ul className="text-blue-11 text-center text-2xl">
      {committees.data.map((committee) => (
        <li className="text-blue-11 hover:text-blue-9 cursor-pointer" key={committee.id}>
          <Link href={`committee/${committee.id}`}>{committee.name}</Link>
        </li>
      ))}
    </ul>
  )
}

export default CommitteePage
