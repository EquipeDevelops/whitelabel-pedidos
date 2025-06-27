import React from 'react'
import style from './style.module.css'
import Header from '../../components/header/Header'
import LandingPage from './landinPage/LandingPage'
import Destaque from './destaque/Destaque'
import ProdutosPrincipais from './produtosPrincipais/ProdutosPrincipais'

const Home = () => {
  return (
    <main className={style.containerMain}>
      <Header />
      <LandingPage />
      <Destaque />
      <ProdutosPrincipais />
    </main>
  )
}

export default Home
