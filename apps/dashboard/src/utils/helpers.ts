// TODO: this does not work ATM, but I feel like there should be a way of implementing. But it needs stateful ids, or memoized ids, so not working like this.

import { notifyComplete, notifyFail, notifyLoading } from "../app/notifications"

type TrpcError = {
  message: string
}

export const baseCreateMutationOpts = () => {
  const id = crypto.randomUUID()
  return {
    onError: (error: TrpcError) => {
      notifyFail({
        title: "Feil",
        message: error.message,
        id,
      })
    },
    onMutate: () => {
      notifyLoading({
        title: "Laster",
        message: "Laster...",
        id,
      })
    },
    onSuccess: () => {
      notifyComplete({
        title: "Suksess",
        message: "Opprettet",
        id,
      })
    },
  }
}

export const baseDeleteMutationOpts = () => {
  const id = crypto.randomUUID()
  return {
    onError: (error: TrpcError) => {
      console.log("running with id", id)
      notifyFail({
        title: "Feil",
        message: error.message,
        id,
      })
    },
    onMutate: () => {
      console.log("running with id", id)
      notifyLoading({
        title: "Laster",
        message: "Laster...",
        id,
      })
    },
    onSuccess: () => {
      console.log("running with id", id)
      notifyComplete({
        title: "Suksess",
        message: "Slettet",
        id,
      })
    },
  }
}

export const baseUpdateMutationOpts = () => {
  const id = crypto.randomUUID()
  return {
    onError: (error: TrpcError) => {
      notifyFail({
        title: "Feil",
        message: error.message,
        id,
      })
    },
    onMutate: () => {
      notifyLoading({
        title: "Laster",
        message: "Laster...",
        id,
      })
    },
    onSuccess: () => {
      notifyComplete({
        title: "Suksess",
        message: "Oppdatert",
        id,
      })
    },
  }
}
