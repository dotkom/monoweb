import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "./Combobox"

export default {
  title: "Combobox",
}

export const Default = () => (
  <Combobox items={items}>
    <ComboboxInput placeholder="Velg type" />
    <ComboboxContent>
      <ComboboxEmpty>Ingen resultater funnet</ComboboxEmpty>
      <ComboboxList>
        {(item) => (
          <ComboboxItem key={item.value} value={item}>
            {item.label}
          </ComboboxItem>
        )}
      </ComboboxList>
    </ComboboxContent>
  </Combobox>
)

const items = [
  {
    label: "Arrangement",
    value: "arrangement",
  },
  {
    label: "Bedriftspresentasjon",
    value: "bedriftspresentasjon",
  },
  {
    label: "Kurs",
    value: "kurs",
  },
  {
    label: "Andre",
    value: "andre",
  },
]
