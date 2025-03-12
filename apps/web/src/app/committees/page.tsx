import { server } from "@/utils/trpc/server"
import Link from "next/link"
import OnlineIcon from "@/components/atoms/OnlineIcon"
import { CommitteesView } from "@/components/views/CommitteesView"

const CommitteePage = async () => {

  return <CommitteesView />

}

export default CommitteePage
