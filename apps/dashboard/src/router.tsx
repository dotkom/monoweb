import { ReactRouter, RootRoute, Route } from "@tanstack/react-router"
import { RootLayout } from "./components/RootLayout"
import { HomePage } from "./components/HomePage"

const root = new RootRoute({
  component: RootLayout,
})

const home = new Route({
  getParentRoute: () => root,
  path: "/",
  component: HomePage,
})

root.addChildren([home])

export const router = new ReactRouter({
  routeTree: root,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
