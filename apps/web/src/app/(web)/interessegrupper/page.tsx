import { Link } from "@/components/link"
import { GroupList } from "@/components/organisms/GroupList"
import { server } from "@/utils/trpc/server"
import { GroupTypeSchema } from "@dotkomonline/rpc/group"
import { Button, Text, TextLink, Title } from "@dotkomonline/ui"
import { IconUsersPlus } from "@tabler/icons-react"

export default async function InterestGroupsListPage() {
  const interestGroups = await server.group.allByType.query(GroupTypeSchema.enum.INTEREST_GROUP)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Title element="h1" size="xl">
          Interessegrupper
        </Title>
        <div className="flex flex-col gap-1 text-muted-foreground">
          <Text>
            På denne siden finner du informasjon om alle de forskjellige interessegruppene i Online. Ser du noe som ser
            interessant ut? Ta kontakt og møt noen med samme interesser som deg. Interessegruppene i Online er grupper
            for alle mulige slags interesser. Har du og en kompis eller to en sær/stilig/fantastisk interesse? Opprett
            en interessegruppe!
          </Text>
          <TextLink href="/sidequests" className="text-sm w-fit">
            Se Sidequests
          </TextLink>
        </div>
      </div>

      <Button
        variant="default"
        element={Link}
        href="https://docs.google.com/forms/d/e/1FAIpQLSebaBslZ3nmh2wubQ_mPJYYU2XNIRlJZ1BooFuH7y6wxylaWA/viewform"
        icon={<IconUsersPlus className="size-5" />}
        className="w-fit"
      >
        Opprett eller overta interessegruppe
      </Button>

      <GroupList groups={interestGroups} />
    </div>
  )
}
