import { useQueryGenericMutationNotification, useQueryNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

export const useCreateEventMutation = () => {
  const trpc = useTRPC()
  const router = useRouter()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()
  return useMutation(
    trpc.event.create.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppretter arrangement...",
          message: "Arrangementet blir opprettet, og du vil bli videresendt til arrangementsiden.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Arrangement opprettet",
          message: `Arrangementet "${data.title}" har blitt opprettet.`,
        })

        await queryClient.invalidateQueries(trpc.event.all.queryOptions())

        router.replace(`/event/${data.id}`)
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under opprettelse av arrangementet: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useUpdateEventMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.event.edit.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer arrangement...",
          message: "Arrangementet blir oppdatert.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Arrangement oppdatert",
          message: `Arrangementet "${data.title}" har blitt oppdatert.`,
        })

        await queryClient.invalidateQueries(trpc.event.get.queryOptions(data.id))
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under oppdatering av arrangementet: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useDeletePoolMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "delete",
  })

  return useMutation(
    trpc.event.attendance.deletePool.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async () => {
        complete()

        await queryClient.invalidateQueries({ queryKey: trpc.event.get.queryKey() })
        await queryClient.invalidateQueries({ queryKey: trpc.event.attendance.getAttendance.queryKey() })
      },
    })
  )
}

export const useCreatePoolMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "create",
  })

  return useMutation(
    trpc.event.attendance.createPool.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async () => {
        complete()

        await queryClient.invalidateQueries({ queryKey: trpc.event.get.queryKey() })
        await queryClient.invalidateQueries({ queryKey: trpc.event.attendance.getAttendance.queryKey() })
      },
    })
  )
}

export const useUpdatePoolMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "update",
  })

  return useMutation(
    trpc.event.attendance.updatePool.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async () => {
        complete()

        await queryClient.invalidateQueries({ queryKey: trpc.event.get.queryKey() })
        await queryClient.invalidateQueries({ queryKey: trpc.event.attendance.getAttendance.queryKey() })
      },
    })
  )
}

export const useAdminForEventMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.event.attendance.adminRegisterForEvent.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Melder på bruker",
          message: "Brukeren blir meldt på arrangementet.",
        })
      },
      onSuccess: async () => {
        notification.complete({
          title: "Påmelding vellykket",
          message: "Bruker ble påmeldt arrangementet.",
        })

        await queryClient.invalidateQueries({ queryKey: trpc.event.get.queryKey() })
        await queryClient.invalidateQueries({ queryKey: trpc.event.attendance.getAttendance.queryKey() })
        await queryClient.invalidateQueries({ queryKey: trpc.event.attendance.getAttendees.queryKey() })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under påmelding: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useRegisterForEventMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.event.attendance.registerForEvent.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Melder på bruker",
          message: "Brukeren blir meldt på arrangementet.",
        })
      },
      onSuccess: async () => {
        notification.complete({
          title: "Påmelding vellykket",
          message: "Bruker ble påmeldt arrangementet.",
        })

        await queryClient.invalidateQueries({ queryKey: trpc.event.get.queryKey() })
        await queryClient.invalidateQueries({ queryKey: trpc.event.attendance.getAttendance.queryKey() })
        await queryClient.invalidateQueries({ queryKey: trpc.event.attendance.getAttendees.queryKey() })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under påmelding: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useDeregisterForEventMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.event.attendance.adminDeregisterForEvent.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Melder av bruker",
          message: "Brukeren blir meldt av arrangementet.",
        })
      },
      onSuccess: async () => {
        notification.complete({
          title: "Avmelding vellykket",
          message: "Bruker ble meldt av arrangementet.",
        })

        await queryClient.invalidateQueries({ queryKey: trpc.event.get.queryKey() })
        await queryClient.invalidateQueries({ queryKey: trpc.event.attendance.getAttendance.queryKey() })
        await queryClient.invalidateQueries({ queryKey: trpc.event.attendance.getAttendees.queryKey() })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under avmelding: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useUpdateEventAttendanceMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()
  return useMutation(
    trpc.event.attendance.registerAttendance.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer oppmøte...",
          message: "Brukerens oppmøte blir oppdatert.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Oppmøte oppdatert",
          message: `Oppmøte er ${data.attended ? "registrert" : "fjernet"}. `,
        })

        await queryClient.invalidateQueries({ queryKey: trpc.event.get.queryKey() })
        await queryClient.invalidateQueries({ queryKey: trpc.event.attendance.getAttendees.queryKey() })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under oppdatering av oppmøte: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useAddAttendanceMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "create",
  })

  return useMutation(
    trpc.event.addAttendance.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async (_, input) => {
        complete()

        await queryClient.invalidateQueries(trpc.event.get.queryOptions(input.eventId))
      },
    })
  )
}

export const useUpdateAttendanceMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "update",
  })

  return useMutation(
    trpc.event.attendance.updateAttendance.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async () => {
        complete()

        await queryClient.invalidateQueries({ queryKey: trpc.event.get.queryKey() })
      },
    })
  )
}

export const useMergeAttendanceMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "update",
  })

  return useMutation(
    trpc.event.attendance.mergeAttendancePools.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async () => {
        complete()

        await queryClient.invalidateQueries({ queryKey: trpc.event.get.queryKey() })
        await queryClient.invalidateQueries({ queryKey: trpc.event.attendance.getAttendance.queryKey() })
      },
    })
  )
}

export const useUpdateSelectionResponsesMutation = () => {
  const trpc = useTRPC()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "update",
  })

  return useMutation(
    trpc.event.attendance.updateSelectionResponses.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: complete,
    })
  )
}

export const useCreateFeedbackFormMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "create",
  })

  return useMutation(
    trpc.event.feedback.createForm.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async (data) => {
        complete()

        await queryClient.invalidateQueries(trpc.event.feedback.findFormByEventId.queryOptions(data.eventId))
      },
    })
  )
}

export const useUpdateFeedbackFormMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "update",
  })

  return useMutation(
    trpc.event.feedback.updateForm.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async (data) => {
        complete()

        await queryClient.invalidateQueries(trpc.event.feedback.findFormByEventId.queryOptions(data.eventId))
      },
    })
  )
}
export const useDeleteFeedbackFormMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "delete",
  })

  return useMutation(
    trpc.event.feedback.deleteForm.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async () => {
        complete()

        await queryClient.invalidateQueries({
          queryKey: trpc.event.feedback.findFormByEventId.queryKey(),
        })
      },
    })
  )
}

export const useRemoveSelectionResponsesMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "delete",
  })

  return useMutation(
    trpc.attendance.removeSelectionResponses.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async (attendanceId) => {
        complete()

        if (attendanceId) {
          await queryClient.invalidateQueries(
            trpc.attendance.getSelectionResponseResults.queryOptions({ attendanceId })
          )
        }
      },
    })
  )
}
