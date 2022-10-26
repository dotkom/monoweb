import { CareerAd, fetchCareerAd } from "@/api/get-career-ads"
import { GetServerSideProps } from "next"
import React, { FC } from "react"
import { CareerAdView } from "@components/views/CareerAdView"

interface CareerProps {
  career: CareerAd
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const slug = ctx.query.slug as string
  const data = await fetchCareerAd(slug)
  return { props: { career: data } }
}

const CareerAd: FC<CareerProps> = (props: CareerProps) => {
  return <CareerAdView career={props.career} />
}

export default CareerAd
