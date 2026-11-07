import { toast } from "@dotkomonline/ui"

export function showAutomaticCheckInToast(attendeeName: string, onUndoAttendance: () => Promise<void>) {
  let canUndoAttendance = true

  const toastId = toast.add({
    type: "success",
    title: "Oppmøte registrert",
    description: attendeeName,
    actionProps: {
      children: "Angre",
      onClick: () => {
        if (!canUndoAttendance) {
          return
        }

        canUndoAttendance = false
        toast.close(toastId)

        void toast
          .promise(onUndoAttendance(), {
            loading: { title: "Angrer oppmøte...", description: attendeeName },
            success: { title: "Oppmøte angret", description: attendeeName },
            error: { title: "Kunne ikke angre. Oppmøtet er fortsatt registrert.", description: attendeeName },
          })
          .catch(() => {
            // The toast reports the error
          })
      },
    },
  })
}
