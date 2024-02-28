import { notifyComplete, notifyFail } from "../app/notifications"

type TrpcError = {
  message: string
}

export const baseCreateMutationOpts = {
  onError: (error: TrpcError) => {
    notifyFail({
      title: "Feil",
      message: error.message,
    })
  },
  onMutate: () => {
    notifyComplete({
      title: "Laster",
      message: "Laster...",
    })
  },
  onSuccess: () => {
    notifyComplete({
      title: "Suksess",
      message: "Opprettet",
    })
  },
}

export const baseDeleteMutationOpts = {
  onError: (error: TrpcError) => {
    notifyFail({
      title: "Feil",
      message: error.message,
    })
  },
  onMutate: () => {
    notifyComplete({
      title: "Laster",
      message: "Laster...",
    })
  },
  onSuccess: () => {
    notifyComplete({
      title: "Suksess",
      message: "Slettet",
    })
  },
}

export const baseUpdateMutationOpts = {
  onError: (error: TrpcError) => {
    notifyFail({
      title: "Feil",
      message: error.message,
    })
  },
  onMutate: () => {
    notifyComplete({
      title: "Laster",
      message: "Laster...",
    })
  },
  onSuccess: () => {
    notifyComplete({
      title: "Suksess",
      message: "Oppdatert",
    })
  },
}
