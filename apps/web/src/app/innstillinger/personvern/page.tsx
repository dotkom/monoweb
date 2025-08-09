import { auth } from "@/auth"
import { Text, Title, Toggle } from "@dotkomonline/ui"
import { redirect } from "next/navigation"
import type { FC, ReactNode } from "react"

const toggleItems = [
  {
    key: 0,
    optionsText: "Synlig på offentlige påmeldingslister",
    state: false,
  },
  {
    key: 1,
    optionsText: "Tillate at bilder av deg på offentlige arrangementer kan legges ut",
    state: false,
  },
]

const PrivacyOption: FC<{ children?: ReactNode }> = ({ children }) => (
  // const [isChecked, setIsChecked] = useState<boolean>(false)

  <div className="w-full">
    <div className="mb-4 mt-5 flex flex-row justify-around ">
      <p className="w-full flex-auto p-1 text-sm font-normal not-italic">{children}</p>
      <div className="w-1/3 flex justify-center items-center">
        {/* <Toggle label={""} isChecked={isChecked} setIsChecked={setIsChecked}></Toggle>      !!!!! BYTTES NÅR TOGGLETING SKAL BRUKES !!!!!*/}
        <Toggle />
      </div>
    </div>
  </div>
)

function PrivacyModule() {
  return (
    <div className="divide-gray-600 my-5 flex w-full flex-col divide-y">
      {toggleItems.map((item) => (
        <PrivacyOption key={item.key}>{item.optionsText}</PrivacyOption>
      ))}
    </div>
  )
}

const PrivacyPage = async () => {
  const session = await auth.getServerSession()
  if (session === null) {
    redirect("/")
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <Title element="h1" size="xl">
        Personvern
      </Title>
      <Text>Personvernsinnstillinger kommer snart</Text>
    </div>
  )
}

export default PrivacyPage
