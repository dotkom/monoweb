import { modals, type ContextModalProps } from "@mantine/modals";
import { type FC } from "react";
import { notifyComplete } from "../../../app/notifications";
import { trpc } from "../../../utils/trpc";
import { PoolForm, type PoolFormSchema } from "../components/PoolForm/PoolForm";
import { useEventAttendanceGetQuery } from "../queries/use-event-attendance-get-query";

interface EditPoolModalProps {
  poolId: string;
  attendanceId: string;
  defaultValues: PoolFormSchema;
}
export const EditPoolModal: FC<ContextModalProps<EditPoolModalProps>> = ({
  context,
  id,
  innerProps,
}) => {
  const { pools } = useEventAttendanceGetQuery(innerProps.attendanceId);
  const { mutate: updatePool } = trpc.event.attendance.updatePool.useMutation({
    onSuccess: () => {
      notifyComplete({
        title: "Pulje opprettet",
        message: "Puljen er opprettet",
      });
    },
  });
  const onSubmit = (values: PoolFormSchema) => {
    context.closeModal(id);
    updatePool({
      input: {
        limit: values.limit,
        yearCriteria: values.yearCriteria,
      },
      id: innerProps.poolId,
    });
  };

  const onClose = () => context.closeModal(id);
  return pools ? (
    <PoolForm
      defaultValues={innerProps.defaultValues}
      onClose={onClose}
      mode="update"
      onSubmit={onSubmit}
      attendancePools={pools}
    />
  ) : null;
};

export const openEditPoolModal =
  ({ attendanceId, defaultValues, poolId }: EditPoolModalProps) =>
  () =>
    modals.openContextModal({
      modal: "event/attendance/pool/update",
      title: "Endre pulje",
      innerProps: {
        attendanceId,
        defaultValues,
        mode: "update",
        poolId,
      },
    });
