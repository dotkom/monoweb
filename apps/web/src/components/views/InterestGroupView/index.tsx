import { EntryDetailLayout } from "@/components/layout/EntryDetailLayout"
import type { InterestGroup } from "@dotkomonline/types"
import { AvatarGroup, Button, Icon } from "@dotkomonline/ui"
import Image from "next/image"
import type { FC } from "react"

interface DetailIcon {
  icon: string
  text: string
  href: string | null
}

interface InterestGroupViewProps {
  interestGroup: InterestGroup
}

export const InterestGroupView: FC<InterestGroupViewProps> = ({ interestGroup }) => {
  const { name, image, description, isActive, link } = interestGroup

  const avatarUrls = Array.from({ length: 10 }, (_, i) => `https://i.pravatar.cc/150?img=${i}`)
  const isMember = true

  const icons: DetailIcon[] = [
    { icon: "material-symbols:person", text: "Kontaktperson", href: `mailto:${""}` },
    { icon: "logos:slack-icon", text: link ? "Slack-kanal" : "Gruppen har ingen slack-kanal", href: link },
  ]

  return (
    <EntryDetailLayout type={isActive ? "Aktiv" : "Inaktiv"} title={name} color={"BLUE"}>
      <div className="grid gap-x-12 gap-y-6 sm:grid-cols-[18rem_minmax(100px,_1fr)] md:grid-cols-[24rem_minmax(100px,_1fr)]">
        <div className="border-blue-7 flex h-fit flex-col gap-y-3 rounded-lg border-none sm:gap-y-2">
          {image && (
            <div className="relative mb-4 h-64 w-full overflow-hidden rounded-lg bg-[#fff]">
              <Image src={image} alt="Committee logo" fill style={{ objectFit: "cover" }} className="w-full" />
            </div>
          )}
          <div className="px-3 space-y-4">
            <div className="flex flex-row justify-between">
              <AvatarGroup avatarUrls={avatarUrls} maxAvatars={3} size="lg" />
              {isMember ? (
                <Button variant="solid" color="amber">
                  Meld meg inn
                </Button>
              ) : (
                <Button variant="solid" color="red">
                  Meld meg ut
                </Button>
              )}
            </div>

            <div className="bg-slate-8 w-full h-px " />

            <div className="text-blue-12 flex flex-col gap-y-2 text-l">
              {icons.map(({ icon, text, href }, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: icons is a static array
                <div key={index} className="flex items-center gap-x-2">
                  <Icon icon={icon} width="28" />
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
        </div>
        <p>{description}</p>
      </div>
    </EntryDetailLayout>
  )
}
