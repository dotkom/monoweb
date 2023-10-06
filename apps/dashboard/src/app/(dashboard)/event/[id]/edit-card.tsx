import { EventWriteSchema } from "@dotkomonline/types";
import { type FC } from "react";

import { useEditEventMutation } from "../../../../modules/event/mutations/use-edit-event-mutation";
import { useEventWriteForm } from "../write-form";
import { useEventDetailsContext } from "./provider";

export const EventEditCard: FC = () => {
  const { event } = useEventDetailsContext();
  const edit = useEditEventMutation();
  const FormComponent = useEventWriteForm({
    defaultValues: { ...event },
    label: "Oppdater arrangement",
    onSubmit: (data) => {
      const result = EventWriteSchema.required({ id: true }).parse(data);
      edit.mutate(result);
    },
  });

  return <FormComponent />;
};
