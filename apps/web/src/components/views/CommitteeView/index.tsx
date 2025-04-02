import { EntryDetailLayout } from "@/components/layout/EntryDetailLayout"
import { EventList } from "@/components/organisms/EventList"
import type { Event, Group, GroupMember } from "@dotkomonline/types"
import { Icon } from "@dotkomonline/ui"
import Image from "next/image"
import type { FC } from "react"
import OnlineIcon from "@/components/atoms/OnlineIcon"
import { server } from "@/utils/trpc/server"
import Link from "next/link"
import { CommitteeList } from "@/components/organisms/CommitteeList"

interface CommitteeViewProps {
  committee: Group
  events: Event[]
  members: GroupMember[]
}

export const CommitteeView: FC<CommitteeViewProps> = (props: CommitteeViewProps) => {
  const { name, image, email, longDescription } = props.committee

  const icons = [{ icon: "material-symbols:mail", text: email, href: `mailto:${email}` }]

  return (
    <EntryDetailLayout type={null} title={name} color={"BLUE"}>
      <div className="grid gap-x-12 gap-y-6 sm:grid-cols-[18rem_minmax(100px,_1fr)] md:grid-cols-[24rem_minmax(100px,_1fr)]">
        <div className="border-blue-7 flex h-fit flex-col gap-y-3 rounded-lg border-none sm:gap-y-2">
        <OnlineIcon className="w-5/12 mx-auto max-w-[150px] min-w-[120px]" />
          {image && (
            <div className="relative mb-4 h-64 w-full overflow-hidden rounded-lg bg-[#fff]">
              {/* <Image src={image} alt="Committee logo" fill style={{ objectFit: "contain" }} className="w-full" /> */}
            </div>
          )}

          <div className="text-blue-12 flex flex-col gap-y-2 px-1 text-lg">
            {icons.map(({ icon, text, href }) => (
              <div key={icon} className="flex items-center gap-x-2">
                <Icon icon={icon} width="28" />

                <a className="text-blue-11 hover:text-blue-10" href={href} target="_blank" rel="noreferrer">
                  {text ? text : "N/A"}
                </a>
              </div>
            ))}
          </div>

          {/* TODO: Redesign later */}
          <div>
            Members
            <ul>
              {props.members.map((member) => (
                <li key={member.userId}>{member.userId}</li>
              ))}
            </ul>
          </div>
        </div>
        <p>{longDescription}</p>
      </div>
      {/* TODO: Redesign later */}
      <div className="mt-6 flex flex-col gap-x-16 gap-y-12 lg:flex-row">
        <EventList events={props.events} />
        {/* TODO: Separate logic for earlier eventlist later */}
      </div>
    </EntryDetailLayout>
  )
}
export default CommitteeView;