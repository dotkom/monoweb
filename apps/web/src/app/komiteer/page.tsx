import { GroupList } from "@/components/organisms/GroupList"
import { server } from "@/utils/trpc/server"
import { Button, Icon, Tabs, TabsContent, TabsList, TabsTrigger, Text, Title } from "@dotkomonline/ui"
import Link from "next/link"

const CommitteePage = async () => {
  const [committees, nodeCommittees, associatedGroups] = await Promise.all([
    server.group.allByType.query("COMMITTEE"),
    server.group.allByType.query("NODE_COMMITTEE"),
    server.group.allByType.query("ASSOCIATED"),
  ])

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
            <span className="hidden md:block text-base text-gray-500 dark:text-stone-500">({committees.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="nodecommittee"
            className="flex flex-row gap-2 items-center grow h-full text-sm sm:text-lg md:text-xl"
          >
            Nodekomiteer
            <span className="hidden md:block text-base text-gray-500 dark:text-stone-500">
              ({nodeCommittees.length})
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="associated"
            className="flex flex-row gap-2 items-center grow h-full text-sm sm:text-lg md:text-xl"
          >
            Assosierte grupper
            <span className="hidden md:block text-base text-gray-500 dark:text-stone-500">
              ({associatedGroups.length})
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="committee">
          <GroupList groups={committees} />
        </TabsContent>

        <TabsContent value="nodecommittee">
          <GroupList groups={nodeCommittees} />
        </TabsContent>

        <TabsContent value="associated">
          <GroupList groups={associatedGroups} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CommitteePage
