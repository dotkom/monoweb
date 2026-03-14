import { server } from "@/utils/trpc/server"
import Link from "next/link"
import { CompanyListItem } from "./CompanyListItem"
import { Title } from "@dotkomonline/ui"

const CompanyPage = async () => {
  const data = await server.company.all.query()
  const { items } = await server.jobListing.findMany.query()
  const jobListings = items ?? []

  console.log(data)
  console.log(items)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Title element="h1" className="text-3xl font-bold border-b-0">
          Bedrifter
        </Title>
      </div>
      <ul className="text-blue-950 text-center text-2xl flex flex-col gap-10">
        {data?.map((company) => {
          const hasJobListings = jobListings.some((job) => job.company.id === company.id)

          return <CompanyListItem key={company.slug} company={company} hasJobListings={hasJobListings} />
        })}
      </ul>
    </div>
  )
}

export default CompanyPage
