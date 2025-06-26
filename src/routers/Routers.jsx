import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomeLogin from '../pages/homelogin/HomeLogin'
import Principal from '../pages/main/Principal'
import Admin from '../pages/admin/Admin'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/*" element={<HomeLogin/>} />
        <Route path="/main" element={<Principal/>} />
        <Route path="/admin" element={<Admin/>} />

      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter