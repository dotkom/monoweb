import PortableText, { type PortableTextProps } from "@/components/molecules/PortableText";
import { Button } from "@dotkomonline/ui";
import { Title } from "@dotkomonline/ui";
import { type FC } from "react";

import CompanyInterestProcess from "./CompanyInterestProcess";
import OurProducts from "./OurProducts";

export interface Content {
  content: PortableTextProps["blocks"];
}

interface CompanyInfoViewProps {
  companyInfoContent: Array<Content>;
}
export const CompanyInfoView: FC<CompanyInfoViewProps> = (props: CompanyInfoViewProps) => {
  const [header, interest, product, info, contact] = props.companyInfoContent;

  return (
    <div className="flex flex-col gap-6 text-center">
      <div className="bg-amber-2 w-full rounded-lg">
        <div className="mx-auto flex h-[520px] max-w-[768px] flex-col items-center p-4 md:h-[300px] lg:h-[220px]">
          <Title className="text-slate-1 mb-4 mt-5 text-4xl leading-[1.4]">
            Er din bedrift på jakt etter skarpe IT-
            <span className="bg-[url(/for-company-text-decor.svg)]" style={{ backgroundPosition: "50% 88%" }}>
              studenter?
            </span>
          </Title>
          <PortableText blocks={header.content} className="prose text-center" />
        </div>
      </div>
      <div className="mt-5 flex flex-col items-center px-3 text-center ">
        <PortableText blocks={interest.content} className="prose" />
        <a className="mt-4" href="https://interesse.online.ntnu.no">
          <Button>Send Interesse</Button>
        </a>
      </div>
      <PortableText blocks={product.content} className="prose mx-auto my-5 max-w-[768px] px-2 text-center" />
      <OurProducts />
      <div className="bg-blue-5 w-full rounded-lg">
        <CompanyInterestProcess steps={["Kartlegging", "Intern Planlegging", "Tilbud", "Sammarbeid"]} />
      </div>
      <PortableText blocks={info.content} className="prose self-center p-4" />
      <div className="mx-auto flex flex-col items-center p-4">
        <PortableText blocks={contact.content} className="prose my-6 p-3 text-center" />
      </div>
    </div>
  );
};

export default CompanyInfoView;
