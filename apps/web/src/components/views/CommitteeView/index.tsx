import { Committee, Event } from "@dotkomonline/types"

import { EventList } from "@/components/organisms/EventList"
import { FC } from "react"
import { Icon } from "@dotkomonline/ui"
import Image from "next/image"
import { EntryDetailLayout } from "@/components/layout/EntryDetailLayout"

interface CommitteeViewProps {
  committee: Committee
  events?: Event[]
  isLoadingEvents: boolean
}

export const CommitteeView: FC<CommitteeViewProps> = (props: CommitteeViewProps) => {
  const { name, image, email, description } = props.committee

  const icons = [{ icon: "material-symbols:mail", text: email, href: `mailto:${email}` }]

  return (
    <EntryDetailLayout type={null} title={name} color={"BLUE"}>
      <div className="grid gap-x-12 gap-y-6 sm:grid-cols-[18rem_minmax(100px,_1fr)] md:grid-cols-[24rem_minmax(100px,_1fr)]">
        <div className="border-blue-7 flex h-fit flex-col gap-y-3 rounded-lg border-none sm:gap-y-2">
          {image && (
            <div className="relative mb-4 h-64 w-full overflow-hidden rounded-lg bg-[#fff]">
              <Image src={image} alt="Committee logo" fill style={{ objectFit: "contain" }} className="w-full" />
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
        <EventList title={`Tidligere arrangementer`} events={props.events} isLoading={props.isLoadingEvents} />{" "}
        {/* TODO: Separate logic for earlier eventlist later */}
      </div>
    </EntryDetailLayout>
  )
}
