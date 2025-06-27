import React from 'react'
import Conteiner from '../../../components/conteiner/Conteiner'
import style from './style.module.css'

const Destaque = () => {
  return (
    <Conteiner>
      <div className={style.containerMain}>
        <div className={style.containerContent}>
          <h2>Exemplo subtexto</h2>
          <h1>Exemplo de texto do lanche que vai ficar aqui no final</h1>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione ipsa deserunt incidunt odio tempora nobis enim, distinctio, aut architecto mollitia libero iure! Velit nesciunt corporis at? Nihil facere quos vitae?</p>
          <button>Peça já</button>
        </div>
        <div className={style.containerImg}>
          Exemplo imagem
        </div>
      </div>
    </Conteiner>
  )
}

export default Destaque
