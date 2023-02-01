import { BlockContentProps } from "@sanity/block-content-to-react"

import client from "./sanity"

export interface InterestGroup {
    interestgroup_name: string
    interestgroup_description: string
}

const query = `
*[_type == "interestgroup"]{
    interestgroup_name,
    interestgroup_description,
    "logo_url" : logo_url.asset->url,
    wiki_link,
    "bannerimage_url" : bannerimage_url.asset->url,
}
`

export const fetchInterestgroupsData = async (): Promise<InterestGroup> => {
  const res = await client.fetch(query)
  return res
}
