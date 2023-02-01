import { CareerAd, fetchCareerAd } from "@/api/get-career-ads"
import { GetServerSideProps } from "next"
import React, { FC } from "react"
import { CareerAdView } from "@components/views/CareerAdView"

interface CareerProps {
  career: CareerAd
}

export const getServerSideProps: GetServerSideProps<CareerProps> = async (ctx) => {
  const slug = ctx.query.slug as string
  const data = await fetchCareerAd(slug)
  return { props: { career: data } }
}

const CareerAdPage: FC<CareerProps> = (props: CareerProps) => {
  return props.career ? <CareerAdView career={props.career} /> : <div>404 - Sanity not found</div>
}

export default CareerAdPage
