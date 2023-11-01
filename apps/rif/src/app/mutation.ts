import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { type FormSchema } from "./form-schema"

export const useSubmitMutation = () => {
  const router = useRouter()
  return useMutation({
    mutationKey: ["submit"],
    mutationFn: async (data: FormSchema) =>
      fetch("/api/dispatch", {
        method: "POST",
        body: JSON.stringify(data),
        credentials: "include",
      }),
    onError: (err) =>
      alert(`Det oppsto en feil under prosesseringen. Vennligst meld fra til dotkom@online.ntnu.no: ${err}`),
    onSuccess: () => {
      router.push("/takk")
    },
  })
}
