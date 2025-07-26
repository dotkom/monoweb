import { EntryDetailLayout } from "@/components/layout/EntryDetailLayout"
import { EventList } from "@/components/organisms/EventList"
import type { AttendanceEvent, Company } from "@dotkomonline/types"
import { Icon, Text, Title } from "@dotkomonline/ui"
import Image from "next/image"
import type { FC } from "react"

interface CompanyViewProps {
  company: Company
  attendanceEvents: AttendanceEvent[]
}

export const CompanyView: FC<CompanyViewProps> = (props: CompanyViewProps) => {
  const { name, description, phone, email, website, location, imageUrl } = props.company

  const icons = [
    { icon: "material-symbols:location-on", text: location, href: null },
    { icon: "ph:globe-bold", text: "Nettside", href: website },
    { icon: "material-symbols:mail", text: email, href: `mailto:${email}` },
    { icon: "material-symbols:phone-enabled", text: phone, href: `tel:${phone}` },
  ]

  return (
    <EntryDetailLayout title={name} color={"BLUE"}>
      <div className="grid gap-x-12 gap-y-6 sm:grid-cols-[18rem_minmax(100px,_1fr)] md:grid-cols-[24rem_minmax(100px,_1fr)]">
        <div className="border-blue-600 flex h-fit flex-col gap-y-3 rounded-lg border-none sm:gap-y-2">
          {imageUrl && (
            <div className="relative mb-4 h-64 w-full overflow-hidden rounded-lg bg-[#fff]">
              <a href={website} target="_blank" rel="noreferrer">
                <Image src={imageUrl} alt="Company logo" fill style={{ objectFit: "contain" }} className="w-full" />
              </a>
            </div>
          )}

          <div className="text-black flex flex-col gap-y-2 px-1 text-lg">
            {icons.map(({ icon, text, href }) => (
              <div key={icon} className="flex items-center gap-x-2">
                <Icon icon={icon} width="28" />
                {href === null ? (
                  <Text element="span">{text}</Text>
                ) : (
                  <a className="text-blue-950 hover:text-blue-900" href={href} target="_blank" rel="noreferrer">
                    {text}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
        <Text>{description}</Text>
      </div>
      {/* TODO: Redesign later */}
      <div className="mt-6 flex flex-col gap-2">
        <Title element="h2">Arrangementer</Title>
        <EventList attendanceEvents={props.attendanceEvents} />
      </div>
    </EntryDetailLayout>
  )
}
