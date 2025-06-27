import React from 'react'
import style from './style.module.css'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <header className={style.containerMain}>
      <div className={style.logo}>
        <p>Marca</p>
      </div>
      <ul className={style.linksNav}>
        <li><a href="#">Sobre</a></li>
        <li><a href="#">Localização</a></li>
        <li><a href="#">Cardápio</a></li>
        <li><a href="#">Contato</a></li>
      </ul>
      <ul className={style.linksAuth}>
        <li><Link to="/auth/1">Login</Link></li>
        <li><Link to="/auth/0">Registrar-se</Link></li>
      </ul>
    </header>
  )
}

export default Header
