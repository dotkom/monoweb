import { getServerClient } from "@/utils/trpc/serverClient"
import Link from "next/link"

const CommitteePage = async () => {
  const serverClient = await getServerClient()
  const committees = await serverClient.committee.all()

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
