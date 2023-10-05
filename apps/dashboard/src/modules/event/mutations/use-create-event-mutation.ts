import { useRouter } from "next/navigation";

import { useQueryNotification } from "../../../app/notifications";
import { trpc } from "../../../utils/trpc";

export const useCreateEventMutation = () => {
    const utils = trpc.useContext();
    const router = useRouter();
    const notification = useQueryNotification();

    return trpc.event.create.useMutation({
        onError: (err) => {
            notification.fail({
                message: `En feil oppsto under opprettelse av arrangementet: ${err.toString()}.`,
                title: "Feil oppsto",
            });
        },
        onMutate: () => {
            notification.loading({
                message: "Arrangementet blir opprettet, og du vil bli videresendt til arrangementsiden.",
                title: "Oppretter arrangement...",
            });
        },
        onSuccess: (data) => {
            notification.complete({
                message: `Arrangementet "${data.title}" har blitt opprettet.`,
                title: "Arrangement opprettet",
            });

            utils.event.all.invalidate();
            router.push(`/event/${data.id}`);
        },
    });
};
