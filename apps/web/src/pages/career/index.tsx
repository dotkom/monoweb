import { CareerAd, fetchCareerAds } from "@/api/get-career-ads"
import CareerView from "@/components/views/CareerView"
import { GetServerSideProps } from "next"
import { FC } from "react"

export interface CareerProps {
  careers: CareerAd[]
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const slug = ctx.query.slug as string
  const data = await fetchCareerAds()
  return { props: { careers: data } }
}

const Career: FC<CareerProps> = (props: CareerProps) => {
  return <CareerView careers={props.careers} />
}

export default Career
