import React from 'react';
import Conteiner from '../../../components/conteiner/Conteiner';
import style from './style.module.css';
import { GiShoppingCart } from "react-icons/gi";

const ProdutosPrincipais = () => {
  return (
    <Conteiner>
      <div className={style.containerMain}>
        <div className={style.containerTitles}>
          <h2>Exemplo subTexto</h2>
          <h1>Exemplo texto de produtos destaque aqui</h1>
        </div>
        <ul className={style.productsList}>
          <li>
            <h3>Nome produto</h3>
            <p>Exemplo de texto do lanche por causa disso e isso</p>
            <p>R$40</p>
            <button><GiShoppingCart />Quero esse</button>
            <div>Exemplo imagem</div>
          </li>
          <li>
            <h3>Nome produto</h3>
            <p>Exemplo de texto do lanchepor causa disso e isso</p>
            <p>R$40</p>
            <button><GiShoppingCart />Quero esse</button>
            <div>Exemplo imagem</div>
          </li>
          <li>
            <h3>Nome produto</h3>
            <p>Exemplo de texto do lanchepor causa disso e isso</p>
            <p>R$40</p>
            <button><GiShoppingCart />Quero esse</button>
            <div>Exemplo imagem</div>
          </li>
          <li>
            <h3>Nome produto</h3>
            <p>Exemplo de texto do lanchepor causa disso e isso</p>
            <p>R$40</p>
            <button><GiShoppingCart />Quero esse</button>
            <div>Exemplo imagem</div>
          </li>
        </ul>
      </div>
    </Conteiner>
  );
};

export default ProdutosPrincipais;
