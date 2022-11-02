import { createRoutesFromElements, createBrowserRouter, Route } from "react-router-dom"

import { RootLayout } from "../components/RootLayout"

const routes = createRoutesFromElements(<Route path="/" element={<RootLayout />} />)

export const router = createBrowserRouter(routes)
