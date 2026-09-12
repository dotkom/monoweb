import { Box, Stack, Text } from "@mantine/core"
import { modals } from "@mantine/modals"

interface ConfirmDeleteModalProps {
  title: string
  text: string
  // should contain a router push and a delete mutation
  onConfirm: () => void
  confirmText?: string
  cancelText?: string
  additionalInfoText?: string
}

export const useConfirmDeleteModal = (props: ConfirmDeleteModalProps) => () => {
  return ConfirmDeleteModal(props)
}

export const ConfirmDeleteModal = (props: ConfirmDeleteModalProps) => {
  return modals.openConfirmModal({
    title: props.title,
    children: (
      <Stack>
        {props.additionalInfoText && (
          <Box>
            <Text fz="sm">{props.additionalInfoText}</Text>
          </Box>
        )}
        <Box>
          <Text c="red" mb={20} fw={700}>
            {props.text}
          </Text>
        </Box>
      </Stack>
    ),
    confirmProps: { color: "red" },
    labels: { confirm: props.confirmText ?? "Slett", cancel: props.cancelText ?? "ikke slett" },
    onConfirm: props.onConfirm,
  })
}
