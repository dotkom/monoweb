import { Card, Grid, Modal, Text, Tabs, Title, useMantineTheme } from "@mantine/core"
import { createContext, FC, useContext } from "react"
import { Committee, Event, EventWrite, EventWriteSchema } from "@dotkomonline/types"
import { Icon } from "@iconify/react"
import { EventDetailsCommittees } from "./EventCommitteeDetailsForm"
import { trpc } from "../../trpc"
import { useEventWriteForm } from "./EventWriteForm"

const EventDetailsCompanies: FC = () => {
  return <h1>Companies</h1>
}

const SIDEBAR_LINKS = [
  {
    icon: "tabler:building-warehouse",
    label: "Bedrifter",
    slug: "event",
    component: EventDetailsCommittees,
  },
  {
    icon: "tabler:tent",
    label: "Komiteer",
    slug: "committee",
    component: EventDetailsCompanies,
  },
]

/** Context consisting of everything required to use and render the form */
export const EventDetailsContext = createContext<{
  event: Event
} | null>(null)
export const useEventDetailsContext = () => {
  const ctx = useContext(EventDetailsContext)
  if (ctx === null) {
    throw new Error("useEventDetailsContext called without Provider in tree")
  }
  return ctx
}

export type EventDetailsModalProps = {
  close: () => void
}

export const EventDetailsModal: FC<EventDetailsModalProps> = ({ close }) => {
  const { event } = useEventDetailsContext()
  const { data: committees = [] } = trpc.committee.all.useQuery({ limit: 50 })
  const theme = useMantineTheme()
  const utils = trpc.useContext()
  const create = trpc.event.edit.useMutation({
    onSuccess: () => {
      utils.event.all.invalidate()
    },
  })
  const onFormSubmit = (data: EventWrite) => {
    const result = EventWriteSchema.required({ id: true }).parse(data)
    create.mutate(result)
    close()
  }
  const FormComponent = useEventWriteForm(onFormSubmit, {
    ...event,
  })
  return (
    <Modal title={<Title order={2}>Arrangementdetaljer for '{event.title}'</Title>} fullScreen opened onClose={close}>
      <Grid
        columns={2}
        gutter="xl"
        styles={{
          backgroundColor: theme.colorScheme === "light" ? theme.colors.gray[0] : theme.colors.gray[9],
        }}
      >
        <Grid.Col span={1}>
          <Card withBorder shadow="sm">
            <Text>Endre arrangement</Text>
            <FormComponent committees={committees} />
          </Card>
        </Grid.Col>
        <Grid.Col span={1}>
          <Card withBorder shadow="sm">
            <Tabs defaultValue={SIDEBAR_LINKS[0].slug}>
              <Tabs.List>
                {SIDEBAR_LINKS.map(({ label, icon, slug }) => (
                  <Tabs.Tab key={slug} value={slug} icon={<Icon icon={icon} width={14} height={14} />}>
                    {label}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
              {SIDEBAR_LINKS.map(({ slug, component: Component }) => (
                <Tabs.Panel value={slug}>
                  <Component />
                </Tabs.Panel>
              ))}
            </Tabs>
          </Card>
        </Grid.Col>
      </Grid>
    </Modal>
  )
}
