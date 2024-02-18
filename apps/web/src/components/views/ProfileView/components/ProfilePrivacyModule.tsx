import PersonvernOption from "./ProfileToggleOption"

export const personList = [
  { key: 0, optionsText: "Synlig på offentlige påmeldingslister", state: false },
  { key: 1, optionsText: "Tillate at bilder av deg på offentlige arrangementer kan legges ut", state: false },
]

function PrivacyModule() {
  return (
    <div className="divide-slate-7 my-5 flex w-full flex-col divide-y">
      {personList.map((title) => (
        <PersonvernOption key={title.key}>{title.optionsText}</PersonvernOption>
      ))}
    </div>
  )
}

export default PrivacyModule
