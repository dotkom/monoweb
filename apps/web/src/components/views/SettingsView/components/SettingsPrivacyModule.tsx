import { PrivacyOption } from "./SettingsToggleOption"

export const toggleItems = [
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

export function PrivacyModule() {
  return (
    <div className="divide-slate-7 my-5 flex w-full flex-col divide-y">
      {toggleItems.map((item) => (
        <PrivacyOption key={item.key}>{item.optionsText}</PrivacyOption>
      ))}
    </div>
  )
}
