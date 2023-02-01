import { FC } from "react"
import {
  EuiPage,
  EuiPageSidebar,
  EuiPageBody,
  EuiHeader,
  EuiHeaderSectionItem,
  EuiHeaderLink,
  EuiHeaderLogo,
  EuiFlexGroup,
} from "@elastic/eui"
import { Outlet } from "@tanstack/react-router"
import { Sidebar } from "./Sidebar"

export const RootLayout: FC = () => {
  return (
    <EuiFlexGroup direction="column" gutterSize="none" style={{ minHeight: "100vh" }}>
      <EuiHeader>
        <EuiHeaderSectionItem border="right">
          <EuiHeaderLogo href="/">OnlineWeb Dashboard</EuiHeaderLogo>
        </EuiHeaderSectionItem>
        <EuiHeaderSectionItem>
          <EuiHeaderLink href="https://new.online.ntnu.no">Tilbake til OnlineWeb</EuiHeaderLink>
        </EuiHeaderSectionItem>
      </EuiHeader>
      <EuiPage paddingSize="none" grow>
        <EuiPageSidebar paddingSize="m">
          <Sidebar />
        </EuiPageSidebar>
        <EuiPageBody paddingSize="m" panelled>
          <Outlet />
        </EuiPageBody>
      </EuiPage>
    </EuiFlexGroup>
  )
}
