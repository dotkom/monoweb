import { Button } from "@dotkomonline/ui"
import { FC } from "react"

import PortableText, { PortableTextProps } from "@/components/molecules/PortableText"

import CompanyInterestProcess from "./CompanyInterestProcess"
import OurProducts from "./OurProducts"
import { Title } from "@dotkomonline/ui"

export type Content = { content: PortableTextProps["blocks"] }

interface CompanyInfoViewProps {
  companyInfoContent: Content[]
}
export const CompanyInfoView: FC<CompanyInfoViewProps> = (props: CompanyInfoViewProps) => {
  const [header, interest, product, info, contact] = props.companyInfoContent

  return (
    <div className="flex flex-col gap-6 text-center">
      <div className="bg-amber-2 w-full rounded-lg">
        <div className="mx-auto flex h-[520px] max-w-[768px] flex-col items-center p-4 md:h-[300px] lg:h-[220px]">
          <Title className="text-slate-1 mt-5 mb-4 text-4xl leading-[1.4]">
            Er din bedrift på jakt etter skarpe IT-
            <span style={{ backgroundPosition: "50% 88%" }} className="bg-[url(/for-company-text-decor.svg)]">
              studenter?
            </span>
          </Title>
          <PortableText className="prose text-center" blocks={header.content} />
        </div>
      </div>
      <div className="mt-5 flex flex-col items-center px-3 text-center ">
        <PortableText className="prose" blocks={interest.content} />
        <a href="https://interesse.online.ntnu.no" className="mt-4">
          <Button>Send Interesse</Button>
        </a>
      </div>
      <PortableText className="prose my-5 mx-auto max-w-[768px] px-2 text-center" blocks={product.content} />
      <OurProducts />
      <div className="bg-blue-5 w-full rounded-lg">
        <CompanyInterestProcess steps={["Kartlegging", "Intern Planlegging", "Tilbud", "Sammarbeid"]} />
      </div>
      <PortableText className="prose self-center p-4" blocks={info.content} />
      <div className="mx-auto flex flex-col items-center p-4">
        <PortableText className="prose my-6 p-3 text-center" blocks={contact.content} />
      </div>
    </div>
  )
}

export default CompanyInfoView
