import { FC } from "react"
import { Company, Event } from "@dotkomonline/types"
import { Icon } from "@dotkomonline/ui"
import { CompanyEventList } from "./CompanyEventList"

interface IndividualCompanyViewProps {
  company: Company
  events: Event[]
  isLoadingEvents: boolean
}

export const IndividualCompanyView: FC<IndividualCompanyViewProps> = (props: IndividualCompanyViewProps) => {
  const { name, description, phone, email, website, location, type, image } = props.company

  return (
    <div className="mx-auto mb-20 flex w-11/12 max-w-6xl flex-col gap-y-16">
      <div className="flex flex-col gap-y-6">
        <div className="border-blue-8 flex w-full items-end justify-between border-b-2 pb-2">
          <h1>{name}</h1>
          <div className="text-blue-11 text-2xl">{type}</div>
        </div>

        <div className="grid grid-cols-[24rem_minmax(200px,_1fr)] gap-x-12">
          <div className="border-blue-7 h-fit rounded-lg border-none">
            {image && (
              <div className="mb-4 h-fit w-full overflow-hidden rounded-lg bg-[#fff]">
                <a href={website} target="_blank">
                  <img src={image} alt="Company logo" className="w-full" />
                </a>
              </div>
            )}

            <div className="text-blue-12 flex flex-col gap-y-2 px-1 text-lg [&>*]:flex [&>*]:items-center [&>*]:gap-x-2">
              <div>
                <Icon icon="ph:globe" width="28"></Icon>
                <a className="text-blue-11 hover:text-blue-10" href={website}>
                  Website
                </a>
              </div>

              <div>
                <Icon icon="material-symbols:location-on" width="28"></Icon>
                <span>{location}</span>
              </div>

              <div>
                <Icon icon="material-symbols:mail-outline" width="28"></Icon>
                {/* <a className="text-blue-11 hover:text-blue-10" href={`mailto:${email}`}>{email}</a> */}
                <span>{email}</span>
              </div>

              <div>
                <Icon icon="material-symbols:phone-enabled-outline" width="28"></Icon>
                <span>{phone}</span>
              </div>

              {/* {lines.map((line) => (
              <div className="text-blue-12 flex items-center gap-x-2 text-lg">
                <Icon icon={line.icon} className="" width="28"></Icon>
                {line.isLink ? (
                  <a className="text-blue-11 hover:text-blue-10" href={line.value}>
                    Website
                  </a>
                ) : (
                  <span>{line.value}</span>
                )}
              </div>
            ))} */}
            </div>
          </div>
          <div>
            <p>
              {description}
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur ea quidem quia fuga ipsa, quod reprehenderit qui consequuntur? Ab eaque numquam quisquam accusamus velit deserunt beatae enim quibusdam officia quod.
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur ea quidem quia fuga ipsa, quod reprehenderit qui consequuntur? Ab eaque numquam quisquam accusamus velit deserunt beatae enim quibusdam officia quod. <br /> <br />
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur ea quidem quia fuga ipsa, quod reprehenderit qui consequuntur? Ab eaque numquam quisquam accusamus velit deserunt beatae enim quibusdam officia quod.

            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-nowrap gap-x-16"> 
        <CompanyEventList title={`Kommende arrangementer`} events={props.events} isLoading={props.isLoadingEvents} />
        <CompanyEventList title={`Åpne jobbtilbud`} events={props.events} isLoading={props.isLoadingEvents} />
      </div>

    </div>
  )
}
