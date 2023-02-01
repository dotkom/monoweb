import { FC, useState } from "react"
import { EuiSideNav, EuiSideNavItemType } from "@elastic/eui"
import { htmlIdGenerator } from "@elastic/eui"

const navigation: EuiSideNavItemType<unknown>[] = [
  {
    name: "Arrangementer",
    id: htmlIdGenerator()(),
    items: [
      {
        name: "Arrangementer",
        id: htmlIdGenerator()(),
        href: "/event",
      },
    ],
  },
  {
    name: "Komiteer",
    id: htmlIdGenerator()(),
    items: [
      {
        name: "Komiteer",
        id: htmlIdGenerator()(),
        href: "/committee",
      },
    ],
  },
]

export const Sidebar: FC = () => {
  const [isSideNavOpenOnMobile, setSideNavOpenOnMobile] = useState(false)

  return (
    <EuiSideNav
      mobileTitle="Åpne navigasjon"
      toggleOpenOnMobile={() => setSideNavOpenOnMobile((s) => !s)}
      isOpenOnMobile={isSideNavOpenOnMobile}
      items={navigation}
    />
  )
}
