import client from "./sanity"

export type InterestGroup = {
    interestgroup_name: string,
    interestgroup_description: string,
    logo_url: {asset: {url: string}},
    bannerimage_url: {asset: {url: string}},
    bannercolor: {hex: string}
}

const query = `
*[_type == "interestgroup"]{
    interestgroup_name,
    interestgroup_description,
    logo_url { asset-> {url} },
    bannerimage_url { asset-> {url} },
    bannercolor { hex },
}
`
// "logo_url" : logo_url.asset->url,
// wiki_link,
// "bannerimage_url" : bannerimage_url.asset->url,

export const fetchInterestgroupsData = async (): Promise<InterestGroup[]> => {
  const res = await client.fetch(query)
  return res
}
