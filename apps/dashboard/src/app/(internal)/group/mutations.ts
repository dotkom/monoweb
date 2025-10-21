import { useQueryGenericMutationNotification, useQueryNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc-client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useCreateGroupMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.group.create.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppretter gruppe...",
          message: "Gruppen blir opprettet.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Gruppen er opprettet",
          message: `Gruppen "${data.name}" har blitt oppdatert.`,
        })

        await queryClient.invalidateQueries(trpc.group.all.queryOptions())
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under opprettelsen: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useDeleteGroupMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.group.delete.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Sletter gruppen",
          message: "Gruppen slettes. Vennligst vent.",
        })
      },
      onSuccess: async () => {
        notification.complete({
          title: "Gruppen er slettet",
          message: "Gruppen er fjernet fra systemet.",
        })

        await queryClient.invalidateQueries(trpc.group.all.queryOptions())
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under slettingen: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useUpdateGroupMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.group.update.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer",
          message: "Gruppen blir oppdatert.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Oppdatert",
          message: `Gruppen "${data.name}" har blitt oppdatert.`,
        })

        await queryClient.invalidateQueries(trpc.group.get.queryOptions(data.slug))
        await queryClient.invalidateQueries(trpc.group.all.queryOptions())
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under oppdatering: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useCreateGroupRoleMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "create",
  })

  return useMutation(
    trpc.group.createRole.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async (_, input) => {
        complete()

        await queryClient.invalidateQueries(trpc.group.all.queryOptions())
        await queryClient.invalidateQueries(trpc.group.get.queryOptions(input.groupId))
        await queryClient.invalidateQueries(trpc.group.getMembers.queryOptions(input.groupId))
      },
    })
  )
}

export const useUpdateGroupRoleMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "update",
  })

  return useMutation(
    trpc.group.updateRole.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async (data) => {
        complete()

        await queryClient.invalidateQueries(trpc.group.all.queryOptions())
        await queryClient.invalidateQueries(trpc.group.get.queryOptions(data.groupId))
        await queryClient.invalidateQueries(trpc.group.getMembers.queryOptions(data.groupId))
      },
    })
  )
}

export const useStartGroupMembershipMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "create",
  })

  return useMutation(
    trpc.group.startMembership.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async (_, input) => {
        complete()

        await queryClient.invalidateQueries(trpc.group.getMembers.queryOptions(input.groupId))
        await queryClient.invalidateQueries(
          trpc.group.getMember.queryOptions({ groupId: input.groupId, userId: input.userId })
        )
        await queryClient.invalidateQueries(
          trpc.workspace.getMembersForGroup.queryOptions({ groupSlug: input.groupId })
        )
      },
    })
  )
}

export const useEndGroupMembershipMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "delete",
  })

  return useMutation(
    trpc.group.endMembership.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async (_, input) => {
        complete()

        await queryClient.invalidateQueries(trpc.group.getMembers.queryOptions(input.groupId))
        await queryClient.invalidateQueries(
          trpc.group.getMember.queryOptions({ groupId: input.groupId, userId: input.userId })
        )
      },
    })
  )
}

export const useUpdateGroupMembershipMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "update",
  })

  return useMutation(
    trpc.group.updateMembership.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async (data) => {
        complete()

        await queryClient.invalidateQueries(trpc.group.getMembers.queryOptions(data.groupId))
        await queryClient.invalidateQueries(
          trpc.group.getMember.queryOptions({ groupId: data.groupId, userId: data.userId })
        )
      },
    })
  )
}

export const useSyncWorkspaceGroupMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "update",
  })

  return useMutation(
    trpc.workspace.synchronizeGroup.mutationOptions({
      onError: fail,
      onMutate: loading,
      onSuccess: async (_, input) => {
        complete()

        await queryClient.invalidateQueries(
          trpc.workspace.getMembersForGroup.queryOptions({ groupSlug: input.groupSlug })
        )
      },
    })
  )
}

export const useLinkGroupMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.workspace.linkGroup.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Tilknytter gruppe",
          message: "Gruppen blir tilknyttet til Workspace. Vennligst vent.",
        })
      },
      onSuccess: async (group) => {
        notification.complete({
          title: "Gruppen er tilknyttet",
          message: "Gruppen er tilknyttet til Workspace.",
        })

        await queryClient.invalidateQueries(trpc.group.get.queryOptions(group.slug))
      },
      onError: () => {
        notification.fail({
          title: "Feil oppsto",
          message: "En feil oppsto under tilknytningen.",
        })
      },
    })
  )
}
