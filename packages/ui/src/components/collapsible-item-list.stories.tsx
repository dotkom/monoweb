import { CollapsibleItemList, type CollapsibleListItem } from "./collapsible-item-list"
import { Text } from "../atoms/Typography/Text"
import { useState } from "react"

const createItem = (text: string, color: string): CollapsibleListItem => {
  const id = text.toLowerCase().replaceAll(" ", "-")

  return {
    id,
    text,
    href: `#${id}`,
    icon: (
      <span
        className="flex items-center justify-center rounded-full font-body text-white leading-none"
        style={{ backgroundColor: color }}
      >
        {text.slice(-1)}
      </span>
    ),
  }
}

const items = [
  createItem("Element 1", "#2563eb"),
  createItem("Element 2", "#dc2626"),
  createItem("Element 3", "#059669"),
  createItem("Element 4", "#7c3aed"),
  createItem("Element 5", "#d97706"),
]

export default {
  title: "Collapsible Item List",
  component: CollapsibleItemList,
}

export const AllStates = () => {
  const examples = [
    { title: "Expanded", items: items.slice(0, 3), width: 720 },
    { title: "Two overlapping", items: items.slice(0, 2), width: 192 },
    { title: "Three in a triangle", items: items.slice(0, 3), width: 256 },
    { title: "Collapsed by count", items, width: 720 },
    {
      title: "Missing logos and long names",
      items: items.map((item) => ({
        ...item,
        text: `${item.text} med en veldig lang tekst`,
        icon: null,
      })),
      width: 256,
    },
    { title: "Without links", items: items.map((item) => ({ ...item, href: undefined })), width: 256 },
    { title: "Single item", items: items.slice(0, 1), width: 224 },
    { title: "No items", items: [], width: 224 },
  ]

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      {examples.map((example) => (
        <section key={example.title} className="flex min-w-0 flex-col gap-2">
          <Text className="text-sm text-muted-foreground">{example.title}</Text>
          <div className="flex max-w-full" style={{ width: example.width }}>
            <CollapsibleItemList items={example.items} label="Elementer" emptyContent="Ingen elementer" />
          </div>
        </section>
      ))}
    </div>
  )
}

export const Responsive = () => {
  const [width, setWidth] = useState(320)
  const [count, setCount] = useState(2)

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <label className="flex flex-col gap-2">
        Width: {width}px
        <input
          type="range"
          min={200}
          max={720}
          value={width}
          onChange={(event) => setWidth(Number(event.target.value))}
        />
      </label>
      <label className="flex flex-col gap-2">
        Items: {count}
        <input type="range" min={0} max={5} value={count} onChange={(event) => setCount(Number(event.target.value))} />
      </label>
      <Text className="text-muted-foreground">Resize the row, then open the collapsed list to inspect every item.</Text>
      <div className="flex max-w-full rounded-xl border border-field-border p-4" style={{ width }}>
        <CollapsibleItemList items={items.slice(0, count)} label="Elementer" emptyContent="Ingen elementer" />
      </div>
    </div>
  )
}
