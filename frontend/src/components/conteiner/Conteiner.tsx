import React from 'react'
import style from './style.module.css'

const Conteiner = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className={style.containerMain}>
      {children}
    </section>
  )
}

export default Conteiner
