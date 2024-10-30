import { fieldOfStudyName } from "@/utils/fieldOfStudy"
import { getServerClient } from "@/utils/trpc/serverClient"
import { authOptions } from "@dotkomonline/auth/src/web.app"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { SettingsSection } from "../components/SettingsSection"
import { SettingsField } from "../components/SettingsField"
import { Button, TextInput } from "@dotkomonline/ui"
import Link from "next/link"


const PasswordPage = async () => {
  const session = await getServerSession(authOptions)
  const trpc = await getServerClient()

  if (session === null || session.user == null) {
    redirect("/")
  }

  const user = await trpc.user.getMe()

  if (user === null) {
    redirect("/onboarding")
  }

  const membership = await trpc.membership.get(user.id)

  if (!membership) {
    return <div className="pb-8">
      <h2>Du har ikke noe medlemsskap</h2>
    </div>
  }

  return <>
    <h2>Ditt medlemmskap</h2>
    <SettingsField title="Studieretning">
      <TextInput disabled width="w-full" value={fieldOfStudyName(membership.fieldOfStudy)} className="w-full"/>
    </SettingsField>
    <SettingsField title="Klassetrinn">
      <TextInput disabled width="w-full" value={`${membership.classYear}. klasse`} />
    </SettingsField>

    <SettingsSection className="flex gap-4">
      <Link href="/feide">
        <Button>Oppdater automatisk</Button>
      </Link>
      <Button>Søk om nytt medlemsskap</Button>
    </SettingsSection>
  </>
}

export default PasswordPage
