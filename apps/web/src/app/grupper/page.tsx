import { GroupList } from "@/components/organisms/GroupList"
import { server } from "@/utils/trpc/server"
import { Button, Tabs, TabsContent, TabsList, TabsTrigger, Text, Title } from "@dotkomonline/ui"
import { IconArrowUpRight } from "@tabler/icons-react"
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

      <div className="sm:flex flex-row gap-0.5 items-center">
        <Text className="text-lg">Er du medlem av en interessegruppe?</Text>
        <Button
          variant="text"
          element={Link}
          href="/interessegrupper"
          iconRight={<IconArrowUpRight width={20} height={20} />}
          className="text-lg"
        >
          Se alle interessegrupper her
        </Button>
      </div>

      <Tabs defaultValue="committee" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="dark:border-none w-full sm:w-fit">
            <TabsTrigger value="committee" className="w-full px-3 sm:w-fit min-h-0 min-w-0 flex items-center gap-2">
              Komiteer
              <span className="hidden md:block text-base text-gray-500 dark:text-stone-400 text-sm">
                ({committees.length})
              </span>
            </TabsTrigger>
            <TabsTrigger value="nodecommittee" className="w-full px-3 sm:w-fit min-h-0 min-w-0 flex items-center gap-2">
              Nodekomiteer
              <span className="hidden md:block text-base text-gray-500 dark:text-stone-400 text-sm">
                ({nodeCommittees.length})
              </span>
            </TabsTrigger>
            <TabsTrigger value="associated" className="w-full px-3 sm:w-fit min-h-0 min-w-0 flex items-center gap-2">
              Assosierte grupper
              <span className="hidden md:block text-base text-gray-500 dark:text-stone-400 text-sm">
                ({associatedGroups.length})
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

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
