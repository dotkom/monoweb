import { ReactRouter, RootRoute, Route } from "@tanstack/react-router"
import { RootLayout } from "./components/RootLayout"
import { HomePage } from "./components/HomePage"
import { EventPage } from "./features/event/components/EventPage"

const root = new RootRoute({
  component: RootLayout,
})

const home = new Route({
  getParentRoute: () => root,
  path: "/",
  component: HomePage,
})

const event = new Route({
  getParentRoute: () => root,
  path: "/event",
  component: EventPage,
})

root.addChildren([home, event])

export const router = new ReactRouter({
  routeTree: root,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
