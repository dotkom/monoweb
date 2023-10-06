import { useQueryNotification } from "../../../app/notifications";
import { trpc } from "../../../utils/trpc";

export const useAddCompanyToEventMutation = () => {
  const utils = trpc.useContext();
  const notification = useQueryNotification();

  return trpc.event.company.create.useMutation({
    onMutate: () => {
      notification.loading({
        message: "Legger til bedriften som arrangør av dette arrangementet.",
        title: "Legger til bedrift...",
      });
    },
    onSuccess: () => {
      notification.complete({
        message: "Bedriften har blitt lagt til arrangørlisten.",
        title: "Bedrift lagt til",
      });

      utils.event.company.get.invalidate();
    },
  });
};
