import { type Company, type Event } from "@dotkomonline/types"
import { type FC } from "react"
import { Icon } from "@dotkomonline/ui"
import Image from "next/image"
import { EventList } from "@/components/organisms/EventList"
import { EntryDetailLayout } from "@/components/layout/EntryDetailLayout"

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
    <EntryDetailLayout title={name} type={type} color={"BLUE"}>
      <div className="grid gap-x-12 gap-y-6 sm:grid-cols-[18rem_minmax(100px,_1fr)] md:grid-cols-[24rem_minmax(100px,_1fr)]">
        <div className="border-blue-7 flex h-fit flex-col gap-y-3 rounded-lg border-none sm:gap-y-2">
          {image && (
            <div className="relative mb-4 h-64 w-full overflow-hidden rounded-lg bg-[#fff]">
              <a href={website} target="_blank" rel="noreferrer">
                <Image src={image} alt="Company logo" fill style={{ objectFit: "contain" }} className="w-full" />
              </a>
            </div>
          )}

          <div className="text-blue-12 flex flex-col gap-y-2 px-1 text-lg">
            {icons.map(({ icon, text, href }, index) => (
              <div key={index} className="flex items-center gap-x-2">
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
      {/* TODO: Redesign later */}
      <div className="mt-6 flex flex-col gap-x-16 gap-y-12 lg:flex-row">
        <EventList title={`Kommende arrangementer`} events={props.events} isLoading={props.isLoadingEvents} />
        <EventList title={`Åpne jobbtilbud`} events={props.events} isLoading={props.isLoadingEvents} />{" "}
        {/* TODO: Separate listings list later */}
      </div>
    </EntryDetailLayout>
  )
}
