import { capitalizeFirstLetter } from "@dotkomonline/utils"
import { Text, Tooltip } from "@mantine/core"
import { formatDate } from "date-fns"
import { nb } from "date-fns/locale"

export const DateTooltip = ({ date }: { date: Date }) => {
  const longDate = formatDate(date, "eeee dd. MMMM yyyy HH:mm", { locale: nb })
  const shortDate = formatDate(date, "dd. MMM yyyy", { locale: nb })

  return (
    <Tooltip label={capitalizeFirstLetter(longDate)}>
      <Text size="sm" w="fit-content">
        {shortDate}
      </Text>
    </Tooltip>
  )
}
