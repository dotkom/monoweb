import { Routes, Route } from "react-router-dom"

const DashboardRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<p>Hello World</p>} />
    </Routes>
  )
}

export default DashboardRoutes
