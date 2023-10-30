import { useMutation } from "@tanstack/react-query"
import { FormSchema } from "./form-schema"

export const useSubmitMutation = () => {
  return useMutation({
    mutationKey: ["submit"],
    mutationFn: (data: FormSchema) =>
      fetch("/api/dispatch", {
        method: "POST",
        body: JSON.stringify(data),
        credentials: "include",
      }),
  })
}
