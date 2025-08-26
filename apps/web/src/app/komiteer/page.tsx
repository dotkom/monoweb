import { GroupList } from "@/components/organisms/GroupList"
import { server } from "@/utils/trpc/server"
import { Button, Icon, Tabs, TabsContent, TabsList, TabsTrigger, Text, Title } from "@dotkomonline/ui"
import Link from "next/link"

const CommitteePage = async () => {
  const [allCommittees, allNodeCommittees, allAssociatedGroups] = await Promise.all([
    server.group.allByType.query("COMMITTEE"),
    server.group.allByType.query("NODE_COMMITTEE"),
    server.group.allByType.query("ASSOCIATED"),
  ])

  const activeCommittees = allCommittees.filter((committee) => !committee.deactivatedAt)
  const inactiveCommittees = allCommittees.filter((committee) => committee.deactivatedAt)

  const activeNodeCommittees = allNodeCommittees.filter((committee) => !committee.deactivatedAt)
  const inactiveNodeCommittees = allNodeCommittees.filter((committee) => committee.deactivatedAt)

  const activeAssociatedGroups = allAssociatedGroups.filter((group) => !group.deactivatedAt)
  const inactiveAssociatedGroups = allAssociatedGroups.filter((group) => group.deactivatedAt)

  return (
    <div className="flex flex-col gap-8 min-h-[70dvh]">
      <div className="flex flex-col gap-2">
        <Title element="h1" className="text-4xl">
          Onlines komiteer og assosierte grupper
        </Title>

        <Text>
          Komitémedlemmene våre får Online til å gå rundt, og arbeider for at alle informatikkstudenter skal ha en flott
          studiehverdag.
        </Text>
      </div>

      <div className="flex flex-row gap-0.5 items-center">
        <Text className="text-lg">Er du medlem av en interessegruppe?</Text>
        <Button
          variant="text"
          element={Link}
          href="/interessegrupper"
          iconRight={<Icon icon="tabler:arrow-up-right" />}
          className="text-lg"
        >
          Se alle interessegrupper her
        </Button>
      </div>

      <Tabs defaultValue="committee" className="w-full">
        <TabsList className="w-full h-18 p-2 mb-4">
          <TabsTrigger
            value="committee"
            className="flex flex-row gap-2 items-center grow h-full text-sm sm:text-lg md:text-xl"
          >
            Komiteer
            <span className="hidden md:block text-base text-gray-500 dark:text-stone-500">
              ({activeCommittees.length})
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="nodecommittee"
            className="flex flex-row gap-2 items-center grow h-full text-sm sm:text-lg md:text-xl"
          >
            Nodekomiteer
            <span className="hidden md:block text-base text-gray-500 dark:text-stone-500">
              ({activeNodeCommittees.length})
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="associated"
            className="flex flex-row gap-2 items-center grow h-full text-sm sm:text-lg md:text-xl"
          >
            Assosierte grupper
            <span className="hidden md:block text-base text-gray-500 dark:text-stone-500">
              ({activeAssociatedGroups.length})
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="committee">
          <GroupList groups={activeCommittees} />
          {inactiveCommittees.length > 0 && (
            <div className="flex flex-col gap-4">
              <Title element="h2" size="lg">
                Inaktive
              </Title>

              <GroupList groups={inactiveCommittees} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="nodecommittee">
          <GroupList groups={activeNodeCommittees} />
          {inactiveNodeCommittees.length > 0 && (
            <div className="flex flex-col gap-4">
              <Title element="h2" size="lg">
                Inaktive
              </Title>

              <GroupList groups={inactiveNodeCommittees} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="associated">
          <GroupList groups={activeAssociatedGroups} />
          {inactiveAssociatedGroups.length > 0 && (
            <div className="flex flex-col gap-4">
              <Title element="h2" size="lg">
                Inaktive
              </Title>

              <GroupList groups={inactiveAssociatedGroups} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CommitteePage
