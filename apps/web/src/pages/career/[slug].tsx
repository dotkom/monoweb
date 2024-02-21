import { type GetServerSideProps } from "next"
import React, { type FC } from "react"
import { type JobListing } from "@dotkomonline/types"
import { useRouter } from "next/router"
import { useParams } from "next/navigation"
import { type CareerAd, fetchCareerAd } from "@/api/get-career-ads"
import { JobListingAdView } from "@/components/views/JobListingAdView"
import JobListingView from "@/components/views/JobListingView/JobListingView"
import { trpc } from "@/utils/trpc"

export interface CareerProps {
  careers: JobListing[]
}

const CareerAdPage = () => {
  const params = useParams()

  const slug = params?.slug ? (params.slug as string) : ""
  const { data, isLoading } = trpc.jobListing.get.useQuery(slug, {
    enabled: Boolean(slug),
  })
  // get the id from the url

  if (isLoading) {
    return <p>Loading...</p>
  }

  return data ? <JobListingAdView career={data} /> : <div>404 - Sanity not found</div>
  //   <ul className="text-blue-11 text-center text-2xl">
  //     {data?.data.map((committee) => (
  //       <li className="text-blue-11 hover:text-blue-9 cursor-pointer" key={committee.id}>
  //         <Link href={`committee/${committee.id}`}>{committee.name}</Link>
  //       </li>
  //     ))}
  //   </ul>
  // )
}

export default CareerAdPage
