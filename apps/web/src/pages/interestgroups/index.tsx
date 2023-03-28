import { GetServerSideProps } from "next"
import { FC } from "react"
import { InterestGroup, fetchInterestgroupsData } from "src/api/get-interestgroups"

import { InterestgroupView } from "@/components/views/InterestgroupView/InterestgroupsView"

interface InterestGroupProps {
    interestgroups: InterestGroup[]
}

export const getServerSideProps: GetServerSideProps<InterestGroupProps> = async () => {
  const data = await fetchInterestgroupsData()
  return { props: { interestgroups: data } }
}

const Interestgroup: FC<InterestGroupProps> = (props: InterestGroupProps) => {
  return <InterestgroupView interestgroups={props.interestgroups} />
}

export default Interestgroup
