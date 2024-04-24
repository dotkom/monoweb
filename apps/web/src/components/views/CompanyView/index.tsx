import { EntryDetailLayout } from "@/components/layout/EntryDetailLayout"
import { EventList } from "@/components/organisms/EventList"
import type { Company, Event } from "@dotkomonline/types"
import { Card, Icon } from "@dotkomonline/ui"
import Image from "next/image"
import type { FC } from "react"

interface CompanyViewProps {
  company: Company
  events: Event[]
}

export const CompanyView: FC<CompanyViewProps> = (props: CompanyViewProps) => {
  const { name, description, phone, email, website, location, type, image } = props.company

  const icons = [
    { label: "Kontorlokasjoner", icon: "lucide:building-2", text: location, href: null },
    { label: "Nettside", icon: "lucide:globe", text: website, href: website },
    { label: "Email", icon: "lucide:mail", text: email, href: `mailto:${email}` },
    { label: "Telefon", icon: "lucide:smartphone", text: phone, href: `tel:${phone}` },
  ]

  return (
    <EntryDetailLayout title={name} subtitle={["Bedrift", type]}>
      <div
        className="grid gap-4 sm:grid-cols-[minmax(100px,_1fr)_18rem] md:grid-cols-[minmax(100px,_1fr)_22rem]"
        // className="grid grid-cols-2"
      >
        <Card className="h-fit">
          <h2 className="border-none pb-0 text-3xl font-semibold">Om bedriften</h2>
          <p className="mt-4 whitespace-pre-wrap">{description}</p>
        </Card>
        <div className="flex flex-col gap-y-4 stretch-0">
          {image && (
            <Card className="w-full h-48 relative">
              <a href={website} target="_blank" rel="noreferrer">
                <Image src={image} alt="Company logo" fill style={{ objectFit: "contain" }} />
              </a>
            </Card>
          )}
          <Card className="space-y-4">
            {icons.map(({ label, icon, text, href }, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: icons is a static array
              <div key={index} className="flex items-start gap-x-3">
                <Icon icon={icon} width="20" />
                <div className="flex flex-col">
                  <span className="font-semibold">{label}</span>
                  {href === null ? (
                    <span>{text}</span>
                  ) : (
                    <a className="text-blue-11 hover:text-blue-10" href={href} target="_blank" rel="noreferrer">
                      {text ? text : "N/A"}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* TODO: Redesign later */}
      <div className="mt-6 flex flex-col gap-x-16 gap-y-12 lg:flex-row">
        <EventList title={"Kommende arrangementer"} events={props.events} />
        <EventList title={"Åpne jobbtilbud"} events={props.events} /> {/* TODO: Separate listings list later */}
      </div>
    </EntryDetailLayout>
  )
}
