import { FC } from "react"
import { Company, Event } from "@dotkomonline/types"
import { Icon } from "@dotkomonline/ui"
import { CompanyEventList } from "./CompanyEventList"
import Image from "next/image"

interface CompanyViewProps {
  company: Company
  events?: Event[]
  isLoadingEvents: boolean
}

export const CompanyView: FC<CompanyViewProps> = (props: CompanyViewProps) => {
  const { name, description, phone, email, website, location, type, image } = props.company

  const icons = [
    { icon: "material-symbols:location-on", text: location, href: null },
    { icon: "ph:globe-bold", text: "Nettside", href: website },
    { icon: "material-symbols:mail", text: email, href: `mailto:${email}` },
    { icon: "material-symbols:phone-enabled", text: phone, href: `tel:${phone}` },
  ]

  return (
    <div className="mx-auto mb-20 flex w-[90vw] max-w-screen-lg flex-col gap-y-16">
      <div className="flex flex-col gap-y-6">
        <div className="border-blue-8 flex w-full items-end justify-between gap-x-2 border-b-2 pb-2">
          <h1>{name}</h1>
          <div className="text-blue-11 text-2xl">{type}</div>
        </div>

        <div className="grid gap-x-12 gap-y-6 sm:grid-cols-[18rem_minmax(100px,_1fr)] md:grid-cols-[24rem_minmax(100px,_1fr)]">
          <div className="border-blue-7 flex h-fit flex-col gap-y-3 rounded-lg border-none sm:gap-y-2">
            {image && (
              <div className="relative mb-4 h-64 w-full overflow-hidden rounded-lg bg-[#fff]">
                <a href={website} target="_blank" rel="noreferrer">
                  <Image src={image} alt="Company logo" layout="fill" objectFit="contain" className="w-full" />
                </a>
              </div>
            )}

            <div className="text-blue-12 flex flex-col gap-y-2 px-1 text-lg [&>*]:flex [&>*]:items-center [&>*]:gap-x-2">
              {icons.map(({ icon, text, href }, index) => (
                <div key={index}>
                  <Icon icon={icon} width="28"></Icon>
                  {href === null ? (
                    <span>{text}</span>
                  ) : (
                    <a className="text-blue-11 hover:text-blue-10" href={href} target="_blank" rel="noreferrer">
                      {text ? text : "N/A"}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
          <p>{description}</p>
        </div>
      </div>

      {/* TODO: Redesign later */}
      <div className="flex flex-col gap-x-16 gap-y-12 lg:flex-row">
        <CompanyEventList title={`Kommende arrangementer`} events={props.events} isLoading={props.isLoadingEvents} />
        <CompanyEventList title={`Åpne jobbtilbud`} events={props.events} isLoading={props.isLoadingEvents} />{" "}
        {/* TODO: Separate listings list later */}
      </div>
    </div>
  )
}
