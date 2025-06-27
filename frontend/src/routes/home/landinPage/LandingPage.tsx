import React from 'react';
import Conteiner from '../../../components/conteiner/Conteiner';
import style from './style.module.css';

const LandingPage = () => {
  return (
    <Conteiner>
      <div className={style.containerPage}>
        <div className={style.containerImg}>Exemplo imagem</div>
        <div className={style.containerTexto}>
          <h2>Texto da landing page</h2>
        </div>
      </div>
    </Conteiner>
  );
};

export default LandingPage;
