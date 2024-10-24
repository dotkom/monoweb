import { Button, TextInput } from "@dotkomonline/ui"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

const PasswordPage = async () => {
  const session = await getServerSession()

  if (session === null) {
    redirect("/")
  }

  return <div className="pb-8">
  <h2>Endre passord</h2>
  <div className="flex flex-col space-y-6 mb-6">
    <TextInput label="Nåværende passord" placeholder="Passord" type="password" />
    <TextInput label="Nytt passord" placeholder="Nytt Passord" type="password" />
    <TextInput label="Gjenta nytt passord" placeholder="Gjenta passord" type="password" />
  </div>
  <Button className="float-right mb-6">Endre passord</Button>
</div>
}

export default PasswordPage
