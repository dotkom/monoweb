import {
  createRoutesFromElements,
  createBrowserRouter,
  Route,
} from "react-router-dom";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<h1>Hello world</h1>} />
  )
)
