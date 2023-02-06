import { Button } from "@dotkomonline/ui"
import { BlockContentProps } from "@sanity/block-content-to-react"
import { FC } from "react"

import PortableText from "@components/molecules/PortableText"

import CompanyInterestProcess from "./CompanyInterestProcess"
import OurProducts from "./OurProducts"
import { Title } from "@dotkomonline/ui"

export type Content = BlockContentProps["blocks"]

interface CompanyViewProps {
  companyContent: Content[]
}
export const CompanyView: FC<CompanyViewProps> = (props: CompanyViewProps) => {
  const [header, interest, product, info, contact] = props.companyContent

  return (
    <div className="text-center">
      <div className="bg-amber-2 relative">
        <div className="mx-auto h-[520px] h-[300px] max-w-[768px] p-4 md:h-[300px]">
          <Title className="text-slate-1 mt-5 mb-4 text-4xl leading-[1.4]">
            Er din bedrift på jakt etter skarpe IT-
            <span className="bg-position-[ bg-[50% 88%] bg-[url(/for-company-text-decor.svg)]">studenter?</span>
          </Title>
          <PortableText blocks={header.content} />
        </div>
      </div>
      <div className="mt-5 px-3 text-center">
        <PortableText blocks={interest.content} />
        <a href="https://interesse.online.ntnu.no">
          <Button>Send Interesse</Button>
        </a>
      </div>
      <PortableText className="my-5 mx-auto max-w-[768px] px-2 text-center" blocks={product.content} />
      <OurProducts />
      <div className="bg-blue-9 w-full">
        <CompanyInterestProcess steps={["Kartlegging", "Intern Planlegging", "Tilbud", "Sammarbeid"]} />
      </div>
      <PortableText className="self-center p-4" blocks={info.content} />
      <PortableText className="my-6 p-3 text-center" blocks={contact.content} />
    </div>
  )
}

export default CompanyView
