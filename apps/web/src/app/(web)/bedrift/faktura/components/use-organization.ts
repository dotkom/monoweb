import { useMutation } from "@tanstack/react-query"
import type { Organization } from "./brreg"

export const useOrganization = (onSuccess: (data: Organization) => void) =>
  useMutation({
    mutationKey: ["brreg"],
    mutationFn: async (organizationNumber: string) =>
      fetch(`https://data.brreg.no/enhetsregisteret/api/enheter/${organizationNumber}`, {
        method: "GET",
      }).then((res) => res.json() as Promise<Organization>),
    onError: (err) => console.error(`Oppslag mot Brønnøysundregistrene feilet: ${err}`),
    onSuccess: (data: Organization) => onSuccess(data),
  })
