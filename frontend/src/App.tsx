import React from 'react'
import { GlobalStorage } from './context/GlobalContext'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Footer from './components/footer/Footer'
import Auth from './routes/auth/Auth'
import Home from './routes/home/Home'

function App() {
  
  return (
    <GlobalStorage>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />}/>
          <Route path='/auth' element={<Auth />}/>
        </Routes>
        <Footer />
      </BrowserRouter>
    </GlobalStorage>
  )
}

export default App
