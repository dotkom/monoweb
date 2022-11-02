import { RouterProvider } from "react-router-dom"
import { FC } from "react";
import { router } from "./routes/router";

export const App: FC = () => {
  return (
    <RouterProvider router={router} />
  )
}
