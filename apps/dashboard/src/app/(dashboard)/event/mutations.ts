import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useTRPC } from "../../../trpc"
import { useQueryGenericMutationNotification, useQueryNotification } from "../../notifications"

export const useAddCompanyToEventMutation = () => {
  const trpc = useTRPC()
  const notification = useQueryNotification()
  return useMutation(
    trpc.event.company.create.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Legger til bedrift...",
          message: "Legger til bedriften som arrangør av dette arrangementet.",
        })
      },
      onSuccess: () => {
        notification.complete({
          title: "Bedrift lagt til",
          message: "Bedriften har blitt lagt til arrangørlisten.",
        })
      },
    })
  )
}

export const useCreateEventMutation = () => {
  const trpc = useTRPC()
  const router = useRouter()
  const notification = useQueryNotification()
  return useMutation(
    trpc.event.create.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppretter arrangement...",
          message: "Arrangementet blir opprettet, og du vil bli videresendt til arrangementsiden.",
        })
      },
      onSuccess: (data) => {
        notification.complete({
          title: "Arrangement opprettet",
          message: `Arrangementet "${data.title}" har blitt opprettet.`,
        })

        router.push(`/event/${data.id}`)
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

export const useEditEventWithGroupsMutation = () => {
  const trpc = useTRPC()
  const notification = useQueryNotification()

  return useMutation(
    trpc.event.editWithGroups.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer arrangement...",
          message: "Arrangementet blir oppdatert.",
        })
      },
      onSuccess: (data) => {
        notification.complete({
          title: "Arrangement oppdatert",
          message: `Arrangementet "${data.title}" har blitt oppdatert.`,
        })
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

export const useRemoveCompanyFromEventMutation = () => {
  const trpc = useTRPC()
  const notification = useQueryNotification()
  return useMutation(
    trpc.event.company.delete.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Fjerner bedrift",
          message: "Fjerner bedriften fra arrangørlisten til dette arrangementet.",
        })
      },
      onSuccess: () => {
        notification.complete({
          title: "Bedrift fjernet",
          message: "Bedriften har blitt fjernet fra arrangørlisten.",
        })
      },
    })
  )
}

export const useDeletePoolMutation = () => {
  const trpc = useTRPC()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "delete",
  })

  return useMutation(
    trpc.event.attendance.deletePool.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: complete,
    })
  )
}

export const useCreatePoolMutation = () => {
  const trpc = useTRPC()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "create",
  })

  return useMutation(
    trpc.event.attendance.createPool.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: complete,
    })
  )
}

export const useUpdatePoolMutation = () => {
  const trpc = useTRPC()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "update",
  })

  return useMutation(
    trpc.event.attendance.updatePool.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: complete,
    })
  )
}

export const useAdminForEventMutation = () => {
  const trpc = useTRPC()
  const notification = useQueryNotification()

  return useMutation(
    trpc.event.attendance.adminRegisterForEvent.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Melder på bruker",
          message: "Brukeren blir meldt på arrangementet.",
        })
      },
      onSuccess: (data) => {
        notification.complete({
          title: "Påmelding vellykket",
          message: "Bruker ble påmeldt arrangementet.",
        })
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
  const notification = useQueryNotification()

  return useMutation(
    trpc.event.attendance.registerForEvent.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Melder på bruker",
          message: "Brukeren blir meldt på arrangementet.",
        })
      },
      onSuccess: (data) => {
        notification.complete({
          title: "Påmelding vellykket",
          message: "Bruker ble påmeldt arrangementet.",
        })
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
  const notification = useQueryNotification()

  return useMutation(
    trpc.event.attendance.adminDeregisterForEvent.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Melder av bruker",
          message: "Brukeren blir meldt av arrangementet.",
        })
      },
      onSuccess: () => {
        notification.complete({
          title: "Avmelding vellykket",
          message: "Bruker ble meldt av arrangementet.",
        })
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
  const notification = useQueryNotification()
  return useMutation(
    trpc.event.attendance.registerAttendance.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer oppmøte...",
          message: "Brukerens oppmøte blir oppdatert.",
        })
      },
      onSuccess: (data) => {
        notification.complete({
          title: "Oppmøte oppdatert",
          message: `Oppmøte er ${data.attended ? "registrert" : "fjernet"}. `,
        })
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
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "create",
  })

  return useMutation(
    trpc.event.addAttendance.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: complete,
    })
  )
}

export const useUpdateAttendanceMutation = () => {
  const trpc = useTRPC()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "update",
  })

  return useMutation(
    trpc.event.attendance.updateAttendance.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: complete,
    })
  )
}

export const useMergeAttendanceMutation = () => {
  const trpc = useTRPC()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "update",
  })

  return useMutation(
    trpc.event.attendance.mergeAttendancePools.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: complete,
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
