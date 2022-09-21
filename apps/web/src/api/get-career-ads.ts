import { BlockContentProps } from "@sanity/block-content-to-react"
import client from "./sanity"

export interface CareerAd {
  title: string
  company_name: string
  image: { asset: { url: string } }
  career_type: string
  location: string
  deadline: string
  company_info: string
  content: BlockContentProps["blocks"]
  link: string
}

const adQuery = `*[_type == "career" && slug.current==$slug && !(_id in path("drafts.**"))][0]{
  title,
  company_name,
  image { asset->{url} },
  career_type,
  location,
  deadline,
  company_info,
  content,
  link
}`

const adsQuery = `*[_type == "career" && !(_id in path("drafts.**"))]`

export const fetchCareerAd = async (slug: string): Promise<CareerAd> => {
  const res = await client.fetch(adQuery, { slug })
  return res
}

export const fetchCareerAds = async (): Promise<CareerAd[]> => {
  const res = await client.fetch(adsQuery)
  return res
}
