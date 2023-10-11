import { type GetServerSideProps } from "next"
import React, { type FC } from "react"
import { type CareerAd, fetchCareerAd } from "@/api/get-career-ads"
import { CareerAdView } from "@/components/views/CareerAdView"

interface CareerProps {
  career: CareerAd
}

export const getServerSideProps: GetServerSideProps<CareerProps> = async (ctx) => {
  const slug = ctx.query.slug as string
  const data = await fetchCareerAd(slug)
  return { props: { career: data } }
}

const CareerAdPage: FC<CareerProps> = (props: CareerProps) => props.career ? <CareerAdView career={props.career} /> : <div>404 - Sanity not found</div>

export default CareerAdPage
