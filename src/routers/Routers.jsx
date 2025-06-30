import React from 'react'
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom'
import HomeLogin from '../pages/homelogin/HomeLogin'
import Principal from '../pages/main/Principal'
import Admin from '../pages/admin/Admin'
import { ReportesMain } from '../pages/reportes/ReportesMain'

function AppRouter() {
  return (
    <HashRouter>
      <Routes>

        <Route path="/*" element={<HomeLogin/>} />
        <Route path="/main" element={<Principal/>} />
        <Route path="/report-main" element={<ReportesMain/>} />
        <Route path="/admin" element={<Admin/>} />

      </Routes>
    </HashRouter>
  )
}

export default AppRouter