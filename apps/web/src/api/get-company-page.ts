import { BlockContentProps } from "@sanity/block-content-to-react"
import client from "./sanity"

interface CompanySectionData {
  sections: BlockContentProps["blocks"]
}

const query = `
*[_type == "pages" && page_name == "For Companies"]{
    "sections": sections[]{
      content
    }
  }[0].sections
`

export const fetchCompanySectionData = async (): Promise<CompanySectionData> => {
  const res = await client.fetch(query)
  return res
}
