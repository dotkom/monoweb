import { ContextModalProps, modals } from "@mantine/modals";
import { FC } from "react";
import { Box, Button, Text, Title } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useDeleteInterestGroupMutation } from "src/modules/interest-group/mutations/use-delete-interest-group-mutation";

interface ConfirmDeleteModalProps {
  title: string;
  text: string;
  // should contain a router push and a delete mutation
  onConfirm: () => void;
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
    labels: { confirm: "Slett", cancel: "ikke slett" },
    onConfirm: props.onConfirm,
  });
};
