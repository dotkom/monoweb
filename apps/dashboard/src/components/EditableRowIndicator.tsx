import { Box, Center, Tooltip } from "@mantine/core"
import { IconEye } from "@tabler/icons-react"
import { PermissionTooltip } from "@/components/PermissionTooltip"

interface EditableRowIndicatorProps {
  canEdit: boolean
  readOnlyLabel?: string
  editableLabel?: string
}

export function EditableRowIndicator({
  canEdit,
  readOnlyLabel = "Du kan se dette, men ikke redigere det",
  editableLabel = "Du kan redigere dette",
}: EditableRowIndicatorProps) {
  if (canEdit) {
    return (
      <Tooltip label={editableLabel}>
        <Center w="14px">
          <Box
            w="4px"
            h="20px"
            style={{
              borderRadius: "var(--mantine-radius-xl)",
              backgroundColor: "var(--mantine-color-blue-4)",
            }}
          />
        </Center>
      </Tooltip>
    )
  }

  return (
    <PermissionTooltip allowed={false} label={readOnlyLabel}>
      <Center>
        <IconEye size={14} color="var(--mantine-color-dimmed)" />
      </Center>
    </PermissionTooltip>
  )
}
