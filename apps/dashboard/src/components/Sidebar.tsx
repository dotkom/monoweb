import { FC, useState } from "react"
import { EuiSideNav, EuiSideNavItemType } from "@elastic/eui"
import { htmlIdGenerator } from "@elastic/eui"
import { useRouter } from "@tanstack/react-router"

export const Sidebar: FC = () => {
  const [isSideNavOpenOnMobile, setSideNavOpenOnMobile] = useState(false)
  const router = useRouter()
  const navigation: EuiSideNavItemType<unknown>[] = [
    {
      name: "Arrangementer",
      id: htmlIdGenerator()(),
      items: [
        {
          name: "Arrangementer",
          id: htmlIdGenerator()(),
          href: "#",
          onClick: () => router.navigate({ to: "/event" }),
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
          href: "#",
          onClick: () => router.navigate({ to: "/" }),
        },
      ],
    },
  ]

  return (
    <EuiSideNav
      mobileTitle="Åpne navigasjon"
      toggleOpenOnMobile={() => setSideNavOpenOnMobile((s) => !s)}
      isOpenOnMobile={isSideNavOpenOnMobile}
      items={navigation}
    />
  )
}
