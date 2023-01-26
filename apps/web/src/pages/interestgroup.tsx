import { GetServerSideProps } from "next"
import { FC } from "react"
import { fetchInterestgroupsData } from "src/api/get-interestgroups"

import { InterestgroupView, Content } from "@components/views/InterestgroupView/index"

interface InterestgroupProps {
  interestgroups: Content[]
}

export const getServerSideProps: GetServerSideProps = async () => {
  const data = await fetchInterestgroupsData()
  return { props: { interestgroups: data } }
}

const Interestgroup: FC<InterestgroupProps> = (props: InterestgroupProps) => {

    if (!props.interestgroups) {
        return <div>Loading...</div>
    }
  return <InterestgroupView interestgroupContent={props.interestgroups} />
}

export default Interestgroup
