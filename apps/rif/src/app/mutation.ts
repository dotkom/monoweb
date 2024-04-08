import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import type { FormSchema } from "./form-schema"

export const useSubmitMutation = () => {
  const router = useRouter()
  return useMutation({
    mutationKey: ["submit"],
    mutationFn: async (data: FormSchema) => {
      const response = await fetch("/api/dispatch", {
        method: "POST",
        body: JSON.stringify(data),
        credentials: "include",
      })
      if (!response.ok) {
        throw new Error(`HTTP Code ${response.status} ${response.statusText}`)
      }
      return response
    },
    onError: (err) =>
      alert(`Det oppsto en feil under prosesseringen. Vennligst meld fra til dotkom@online.ntnu.no: ${err}`),
    onSuccess: () => {
      router.push("/takk")
    },
  })
}
