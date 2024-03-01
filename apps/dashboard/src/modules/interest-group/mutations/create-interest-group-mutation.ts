import { useQueryNotification } from "../../../app/notifications";
import { trpc } from "../../../utils/trpc";

export const useCreateInterestGroupMutation = () => {
  const notification = useQueryNotification();

  return trpc.interestGroup.create.useMutation({
    onSuccess: (data) => {
      notification.complete({
        title: "Interessegruppen er opprettet",
        message: `Interessegruppen "${data.name}" har blitt oppdatert.`,
      });
    },
  });
};
