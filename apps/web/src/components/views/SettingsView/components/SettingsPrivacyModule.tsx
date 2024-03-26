import PersonvernOption from "./SettingsToggleOption";

export const toggleItems = [
  {
    optionsText: "Synlig på offentlige påmeldingslister",
    state: false,
  },
  {
    optionsText:
      "Tillate at bilder av deg på offentlige arrangementer kan legges ut",
    state: false,
  },
];

function PrivacyModule() {
  return (
    <div className="divide-slate-7 my-5 flex w-full flex-col divide-y">
      {toggleItems.map((item, key) => (
        <PersonvernOption key={key}>{item.optionsText}</PersonvernOption>
      ))}
    </div>
  );
}

export default PrivacyModule;
