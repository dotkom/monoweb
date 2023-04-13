import { FC } from "react"
import { Company, Event } from "@dotkomonline/types"
import { Icon } from "@dotkomonline/ui"
import { CompanyEventList } from "./CompanyEventList"

interface CompanyViewProps {
  company: Company
  events?: Event[]
  isLoadingEvents: boolean
}

export const CompanyView: FC<CompanyViewProps> = (props: CompanyViewProps) => {
  const { name, description, phone, email, website, location, type, image } = props.company

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
              <div className="mb-4 h-fit w-full overflow-hidden rounded-lg bg-[#fff]">
                <a href={website} target="_blank">
                  <img src={image} alt="Company logo" className="w-full" />
                </a>
              </div>
            )}

            <div className="text-blue-12 flex flex-col gap-y-2 px-1 text-lg [&>*]:flex [&>*]:items-center [&>*]:gap-x-2">
              <div>
                <Icon icon="ph:globe-bold" width="28"></Icon>
                <a className="text-blue-11 hover:text-blue-10" href={website}>
                  Website
                </a>
              </div>

              <div>
                <Icon icon="material-symbols:location-on" width="28"></Icon>
                <span>{location}</span>
              </div>

              <div>
                <Icon icon="material-symbols:mail" width="28"></Icon>
                <span>{email}</span>
              </div>

              <div>
                <Icon icon="material-symbols:phone-enabled" width="28"></Icon>
                <span>{phone}</span>
              </div>
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
