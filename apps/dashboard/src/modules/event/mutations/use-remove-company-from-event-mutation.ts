import { useQueryNotification } from "../../../app/notifications";
import { trpc } from "../../../utils/trpc";

export const useRemoveCompanyFromEventMutation = () => {
    const utils = trpc.useContext();
    const notification = useQueryNotification();

    return trpc.event.company.delete.useMutation({
        onMutate: () => {
            notification.loading({
                message: "Fjerner bedriften fra arrangørlisten til dette arrangementet.",
                title: "Fjerner bedrift",
            });
        },
        onSuccess: () => {
            notification.complete({
                message: "Bedriften har blitt fjernet fra arrangørlisten.",
                title: "Bedrift fjernet",
            });

            utils.event.company.get.invalidate();
        },
    });
};
