import { getServerClient } from "@/utils/trpc/serverClient";
import { authOptions } from "@dotkomonline/auth/src/web.app";
import { FeideDocumentationSchema } from "@dotkomonline/types";
import { Button, Select, SelectContent, SelectGroup, SelectIcon, SelectItem, SelectLabel, SelectPortal, SelectTrigger, SelectValue, SelectViewport, TextInput, Textarea } from "@dotkomonline/ui"
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import Link from "next/link";
import { OnboardingForm } from "./components/OnboardingForm";
import { PropsWithChildren } from "react";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)

  if (session === null) {
    redirect("/")
  }

  const trpc = await getServerClient()

  const existingUser = await trpc.user.getByAuth0Id(session.sub)
  if (existingUser) {
    redirect("/settings")
  }

  const feideDocumentationJWT = cookies().get("feideDocumentationJWT")

  if (!feideDocumentationJWT) {
    return <InnerOnboardingPage>
      <Link href="/feide">
        <Button>Bekreft med Feide</Button>
      </Link>
    </InnerOnboardingPage>
  }

  const feideDocumentation = FeideDocumentationSchema.parse(jwt.decode(feideDocumentationJWT.value)) 

  if (feideDocumentation.givenName === "Jo Gramnæs") {
    feideDocumentation.givenName = "Jo"
  }

  return <InnerOnboardingPage>
      <OnboardingForm session={session} feideDocumentationJWT={feideDocumentationJWT.value} />
  </InnerOnboardingPage>
}

async function InnerOnboardingPage({ children }: PropsWithChildren<{}>) {
  return <div className="flex w-full flex-col space-y-4">
    <h1>Velkommen, Jo!</h1>
    <p>
      Fullfør profilen din for å få tilgang til Onlineweb.
    </p>

    {children}
  </div>
}
