import EmailToggleGroup from "@/components/molecules/Profile/EmailToggleGroup"
import { Button, Icon, TextInput } from "@dotkomonline/ui"
import { FC } from "react"

interface ArticleViewProps {
  emails: string[]
}
const EmailView: FC<ArticleViewProps> = ({ emails }) => {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-medium">Epostadresser</h1>
      <p className="mb-4 text-base">
        Her er en oversikt over e-postadresser som er tilknyttet din konto. Adressen som er markert som primær brukes
        til alle våre e-postlister, gjenoppretning av passord og andre varsler som sendes fra oss.
      </p>
      <ul className="flex flex-col gap-4 p-10">
        {emails.map((email, index) => {
          return (
            <li className="flex items-center gap-2 text-xl font-semibold" key={email}>
              {email}
              {index === 0 ? (
                <>
                  <div className="text-blue-11">
                    <Icon inline={true} icon="tabler:check" width={20} height={20} />
                  </div>
                  <p className="text-sm">Primær</p>
                </>
              ) : (
                <></>
              )}
            </li>
          )
        })}
      </ul>
      <div className="grid grid-cols-3 py-10">
        <p>Primærepost</p>
        <div className="col-span-2 flex items-center gap-10">
          <TextInput />
          <Button>Lagre</Button>
        </div>
      </div>
      <hr />
      <div className="grid grid-cols-3 py-10">
        <p>Legg til ny epost</p>
        <div className="col-span-2 flex items-center gap-10">
          <TextInput />
          <Button>Legg til</Button>
        </div>
      </div>
      <hr className="mb-10" />

      <EmailToggleGroup
        title={"Infomail"}
        description={
          " Her velger du om du ønsker/ikke ønsker Her velger du om du ønsker/ikke ønsker å motta periodiske oppdateringer om hva som skjer i Online fremover."
        }
        toggleLabel={"Jeg vil motta infomail"}
      />
      <EmailToggleGroup
        title={"Muligheter"}
        description={
          "Her kan du velge å få informasjon om diverse arrangement, oppdrag og småjobber relatert til informatikkstudiet."
        }
        toggleLabel={"Jeg vil motta mail om muligheter"}
      />
    </div>
  )
}

export default EmailView
