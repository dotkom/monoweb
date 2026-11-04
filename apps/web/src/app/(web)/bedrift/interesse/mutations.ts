"use client"

import { useTRPC } from "@/utils/trpc/client"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

export const useSubmitInterestMutation = () => {
  const router = useRouter()
  const trpc = useTRPC()

  return useMutation(
    trpc.rif.submit.mutationOptions({
      onError: (err) =>
        alert(`Det oppsto en feil under prosesseringen. Vennligst meld fra til dotkom@online.ntnu.no: ${err.message}`),
      onSuccess: () => {
        router.push("/bedrift/interesse/takk")
      },
    })
  )
}
