import { getServerClient } from "@/utils/trpc/serverClient";
import { authOptions } from "@dotkomonline/auth/src/web.app";
import { FeideDocumentationSchema } from "@dotkomonline/types";
import { Button, Select, SelectContent, SelectGroup, SelectIcon, SelectItem, SelectLabel, SelectPortal, SelectTrigger, SelectValue, SelectViewport, TextInput, Textarea } from "@dotkomonline/ui"
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import Link from "next/link";
import { CountryCodeSelect } from "../settings/components/CountryCodeSelect";
import { PropsWithChildren } from "react";

const SignupSection = ({ children, label, reason }: PropsWithChildren<{label: string, reason: string}>) => (
  <div className="flex flex-col py-2">
    <label htmlFor="phone">{label}:</label>
    <div className="w-full flex space-x-2 mb-1">
      {children}
    </div>
    <p className="text-xs text-slate-7">{reason}</p>
  </div>
)

const SimpleSelect = ({ options }: { options: { label: string, value: string }[] }) => (
  <Select>
    <SelectTrigger>
      <SelectValue placeholder="Velg" />
      <SelectIcon />
    </SelectTrigger>
    <SelectPortal>
      <SelectContent>
        <SelectViewport>
          <SelectGroup>
            {options.map(option => (
              <SelectItem key={option.value} label={option.label} value={option.value} />
            ))}
          </SelectGroup>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </Select>
)

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)
  const trpc = await getServerClient()

  if (session === null) {
    redirect("/")
  }

  const feideDocumentationJWT = cookies().get("feideDocumentationJWT")
  const feideDocumentation = feideDocumentationJWT ? FeideDocumentationSchema.optional().parse(jwt.decode(feideDocumentationJWT.value)) : null

  if (!feideDocumentation) {
    return <Link href="/feide">
        <Button>Bekreft med Feide</Button>
      </Link>
  }

  if (feideDocumentation.givenName === "Jo Gramnæs") {
    feideDocumentation.givenName = "Jo"
  }

  return  (
    <div className="flex w-full flex-col space-y-4">
      <h1>Velkommen, {feideDocumentation.givenName}!</h1>
      <p>
        Fullfør profilen din for å få tilgang til Onlineweb.
      </p>
      <div>
        <SignupSection label="Telefonnummer" reason="Dette vil bli brukt til å kontakte deg om arrangementer og lignende.">
          <TextInput width="w-full" maxLength={8} placeholder="462 64 835"/>
        </SignupSection>

        <SignupSection label="Allergier" reason="Dette vil bli brukt til å tilpasse mat på arrangementer.">
          <TextInput width="w-full" placeholder="Ingen"/>
        </SignupSection>

        <SignupSection label="Kjønn" reason="Dette brukes til statistikk">
          <SimpleSelect options={[
            { label: "Mann", value: "male"},
            { label: "Kvinne", value: "female" },
            { label: "Annet", value: "other" },
          ]}/>
        </SignupSection>
      </div>
    </div>
  )
}
