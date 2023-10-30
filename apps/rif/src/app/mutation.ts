import { useMutation } from "@tanstack/react-query"
import { FormSchema } from "./form-schema"
import { useRouter } from "next/navigation"

export const useSubmitMutation = () => {
  const router = useRouter()
  return useMutation({
    mutationKey: ["submit"],
    mutationFn: (data: FormSchema) =>
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
