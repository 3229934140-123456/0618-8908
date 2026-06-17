import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "@/components/Layout"
import Dashboard from "@/pages/Dashboard"
import Devices from "@/pages/Devices"
import Scenes from "@/pages/Scenes"
import History from "@/pages/History"
import Energy from "@/pages/Energy"
import Members from "@/pages/Members"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/scenes" element={<Scenes />} />
          <Route path="/history" element={<History />} />
          <Route path="/energy" element={<Energy />} />
          <Route path="/members" element={<Members />} />
        </Route>
      </Routes>
    </Router>
  )
}
