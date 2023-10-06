import { useQueryNotification } from "../../../app/notifications";
import { trpc } from "../../../utils/trpc";

export const useEditEventMutation = () => {
  const notification = useQueryNotification();
  const utils = trpc.useContext();

  return trpc.event.edit.useMutation({
    onError: (err) => {
      notification.fail({
        message: `En feil oppsto under oppdatering av arrangementet: ${err.toString()}.`,
        title: "Feil oppsto",
      });
    },
    onMutate: () => {
      notification.loading({
        message: "Arrangementet blir oppdatert.",
        title: "Oppdaterer arrangement...",
      });
    },
    onSuccess: (data) => {
      notification.complete({
        message: `Arrangementet "${data.title}" har blitt oppdatert.`,
        title: "Arrangement oppdatert",
      });

      utils.event.all.invalidate();
      utils.event.get.invalidate();
    },
  });
};
