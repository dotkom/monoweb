import { Link } from "@/components/link"
import { GroupList } from "@/components/organisms/GroupList"
import { server } from "@/utils/trpc/server"
import { Tabs, TabsContent, TabsList, TabsTrigger, Text, Title, cn } from "@dotkomonline/ui"
import { IconArrowUpRight } from "@tabler/icons-react"

const CommitteePage = async () => {
  const [committees, nodeCommittees, associatedGroups] = await Promise.all([
    server.group.allByType.query("COMMITTEE"),
    server.group.allByType.query("NODE_COMMITTEE"),
    server.group.allByType.query("ASSOCIATED"),
  ])

  return (
    <div className="flex flex-col gap-8 min-h-[70dvh]">
      <div className="flex flex-col gap-2">
        <Title element="h1" size="xl">
          Onlines komiteer og assosierte grupper
        </Title>

        <Text className="text-gray-600 dark:text-stone-300">
          Komitémedlemmene våre får Online til å gå rundt, og arbeider for at alle informatikkstudenter skal ha en flott
          studiehverdag.
        </Text>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-stone-300 flex-wrap">
        <span>Er du på utkikk etter en interessegruppe?</span>
        <Link
          href="/interessegrupper"
          className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-4 transition-colors"
        >
          <span>Se alle interessegrupper her</span>
          <IconArrowUpRight className="size-4" />
        </Link>
      </div>

      <Tabs defaultValue="committee">
        <TabsList variant="default" className="h-12! w-full sm:w-135 mb-3">
          <GroupTypeTabTrigger value="committee" label="Komiteer" count={committees.length} />
          <GroupTypeTabTrigger value="nodecommittee" label="Nodekomiteer" count={nodeCommittees.length} />
          <GroupTypeTabTrigger
            className="hidden sm:block"
            value="associated"
            label="Assosierte grupper"
            count={associatedGroups.length}
          />
          <GroupTypeTabTrigger
            className="sm:hidden"
            value="associated"
            label="Assosierte"
            count={associatedGroups.length}
          />
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

interface GroupTypeTabTriggerProps {
  value: string
  label: string
  count: number
  className?: string
}

const GroupTypeTabTrigger = ({ value, label, count, className }: GroupTypeTabTriggerProps) => {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "data-active:bg-gray-100 dark:data-active:bg-stone-700 not-data-active:hover:bg-gray-100 dark:not-data-active:hover:bg-stone-800 text-gray-700 dark:text-stone-300",
        className
      )}
    >
      {label}
      <span className="max-md:hidden text-gray-500 dark:text-stone-400 text-sm">({count})</span>
    </TabsTrigger>
  )
}

export default CommitteePage
