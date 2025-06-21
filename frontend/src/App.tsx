import React from 'react'
import { GlobalStorage } from './context/GlobalContext'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Header from './components/header/Header'
import Footer from './components/footer/Footer'
import Auth from './routes/auth/Auth'

function App() {
  
  return (
    <GlobalStorage>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path='/auth' element={<Auth />}/>
        </Routes>
        <Footer />
      </BrowserRouter>
    </GlobalStorage>
  )
}

export default App
