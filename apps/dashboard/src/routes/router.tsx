import { createRoutesFromElements, createBrowserRouter, Route } from "react-router-dom"

import { RootLayout } from "../components/RootLayout"
import { EventPage } from "../features/event/components/EventPage"

const routes = createRoutesFromElements(
  <Route path="/" element={<RootLayout />}>
    <Route path="event">
      <Route path="events" element={<EventPage />} />
    </Route>
  </Route>
)

export const router = createBrowserRouter(routes)
