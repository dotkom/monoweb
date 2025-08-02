import { Box, Text } from "@mantine/core"
import { modals } from "@mantine/modals"

interface ConfirmDeleteModalProps {
  title: string
  text: string
  // should contain a router push and a delete mutation
  onConfirm: () => void
  confirmText?: string
  cancelText?: string
}

export const useConfirmDeleteModal = (props: ConfirmDeleteModalProps) => () => {
  return modals.openConfirmModal({
    title: props.title,
    children: (
      <Box>
        <Text c="red" mb={20} fw={700}>
          {props.text}
        </Text>
      </Box>
    ),
    confirmProps: { color: "red" },
    labels: { confirm: props.confirmText ?? "Slett", cancel: props.cancelText ?? "ikke slett" },
    onConfirm: props.onConfirm,
  })
}
