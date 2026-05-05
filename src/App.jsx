import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Checklist from './pages/Checklist'
import Hasil from './pages/Hasil'
import Riwayat from './pages/Riwayat'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/hasil"    element={<Hasil />} />
        <Route path="/riwayat"  element={<Riwayat />} />
      </Routes>
    </BrowserRouter>
  )
}
